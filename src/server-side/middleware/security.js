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

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth-specific rate limiter
const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100, // Limit each IP to 100 login attempts per windowMs
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false
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

  // Apply rate limiting to specific routes
  app.use("/auth/getCompanies", limiter);
  app.use("/roadmap", limiter);
  app.use("/statistics", limiter);
  app.use("/profile", limiter);
  
  // Apply stricter rate limiting only to authentication routes
  app.use("/auth", authLimiter);
  app.use("/auth/register", authLimiter);

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