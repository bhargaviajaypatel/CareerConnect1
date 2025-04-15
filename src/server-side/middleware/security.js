import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { readFileSync } from 'fs';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read package.json
const packageJson = JSON.parse(readFileSync(new URL('../../../package.json', import.meta.url)));

// Rate limiting configuration - more lenient in development mode
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // Increased limit for development
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Auth-specific rate limiter (stricter for login/register) - DISABLED IN DEV MODE
const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: process.env.NODE_ENV === 'production' ? 10 : 10000, // Setting extremely high limit for dev
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req, res) => {
    // Skip rate limiting in development mode
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Rate limiter] Skipping rate limit for ${req.method} ${req.originalUrl}`);
      return true; // Skip rate limiting completely in development
    }
    return false;
  }
});

// CSP configuration from package.json
const cspConfig = packageJson.security.csp;

// Convert CSP config to header string
function generateCSPHeader() {
  return Object.entries(cspConfig)
    .map(([directive, sources]) => {
      return `${directive} ${sources.join(' ')}`;
    })
    .join('; ');
}

// Define the main security middleware function
const applySecurityMiddleware = (app) => {
  // Basic security headers from Helmet
  app.use(helmet());

  // Only apply rate limiting in production
  if (process.env.NODE_ENV === 'production') {
    console.log("[Security] Applying rate limits in production mode");
    
    // Apply rate limiting to specific routes
    app.use("/auth/getCompanies", limiter);
    app.use("/roadmap", limiter);
    app.use("/statistics", limiter);
    app.use("/profile", limiter);
    
    // Apply stricter rate limiting only to authentication routes
    app.use("/auth", authLimiter);
    app.use("/auth/register", authLimiter);
  } else {
    console.log("[Security] Rate limiting DISABLED in development mode");
  }

  // Custom security headers middleware
  app.use((req, res, next) => {
    // Custom CSP header
    res.setHeader('Content-Security-Policy', generateCSPHeader());
    
    // XSS Protection
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
    
    next();
  });
};

// Export the function as the default export
export default applySecurityMiddleware; 