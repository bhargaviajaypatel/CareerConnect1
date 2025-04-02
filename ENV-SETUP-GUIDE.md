# Environment Setup Guide for CareerConnect Security

This guide explains how to properly configure environment variables for the secure session management system in CareerConnect.

## Core Security Variables

### JWT and Cookie Secrets

These secrets are used to sign tokens and cookies. They must be strong, random values in production:

```
JWT_ACCESS_SECRET=<strong-random-value>
JWT_REFRESH_SECRET=<different-strong-random-value>
COOKIE_SECRET=<strong-random-value>
```

**How to generate secure values:**

1. Using Node.js:
   ```javascript
   require('crypto').randomBytes(32).toString('hex')
   ```

2. Using OpenSSL (command line):
   ```bash
   openssl rand -hex 32
   ```

3. Using an online secure generator (not recommended for production keys)

**Important:** 
- Use different values for each secret
- Never commit these values to version control
- Rotate these secrets periodically (e.g., every 90 days)
- Minimum recommended length: 32 characters

### Environment Mode

```
NODE_ENV=development
# or
NODE_ENV=production
```

**Effects when set to `production`:**
- Enables secure cookies
- Disables detailed error messages
- Enables stricter security checks
- Shortens token expiry times
- Minimizes response payload information

### Proxy Settings

```
TRUST_PROXY=true
# or
TRUST_PROXY=false
```

**When to use `true`:**
- Your application is behind a load balancer (AWS ELB, Nginx, etc.)
- You're using a reverse proxy
- You're deployed on Heroku, Vercel, or similar platforms

**Effects when set to `true`:**
- Trusts the X-Forwarded-For header for IP determination
- Essential for accurate IP-based security features like:
  - Session IP verification
  - Rate limiting
  - Brute force protection

## Environment-Specific Configuration

### Development Environment

For local development, you can use simpler values:

```
NODE_ENV=development
TRUST_PROXY=false
MONGODB_URI=mongodb://127.0.0.1:27017/CareerConnect
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### Production Environment

For production, ensure:

```
NODE_ENV=production
TRUST_PROXY=true # If behind a proxy
MONGODB_URI=mongodb://[username:password@]host:port/CareerConnect?authSource=admin
CORS_ALLOWED_ORIGINS=https://careerconnect.example.com
```

Generate strong, unique secrets for:
- JWT_ACCESS_SECRET
- JWT_REFRESH_SECRET
- COOKIE_SECRET

### Testing Environment

For automated testing:

```
NODE_ENV=test
TRUST_PROXY=false
MONGODB_URI=mongodb://127.0.0.1:27017/CareerConnect_test
RATE_LIMIT_MAX=1000 # Higher to avoid test failures due to rate limiting
```

## Deployment Methods

### Environment File (.env)

Best for development and simple deployments:
1. Create a `.env` file in the project root
2. Add all variables as KEY=VALUE pairs
3. Ensure `.env` is in your `.gitignore`

### Docker / Container Environments

For containerized deployments:
1. Use environment variables in your Docker Compose file:
   ```yaml
   environment:
     - NODE_ENV=production
     - JWT_ACCESS_SECRET=xxx
     - JWT_REFRESH_SECRET=xxx
     - COOKIE_SECRET=xxx
     - TRUST_PROXY=true
   ```
2. Or use Docker secrets for sensitive values

### Cloud Platforms

**AWS:**
- Use AWS Parameter Store or Secrets Manager for secrets
- Set environment variables in your ECS task definition or Elastic Beanstalk configuration

**Heroku / Vercel / Netlify:**
- Use the platform's environment variable settings in their dashboard
- Automatically set TRUST_PROXY=true as these all use proxies

## Security Best Practices

1. **Separate environments:** Use different secrets for development, staging, and production
2. **Least privilege access:** Limit who can access production secrets
3. **Secret rotation:** Change secrets periodically, especially after team member departures
4. **Monitoring:** Set up alerts for unauthorized access attempts
5. **Backup**: Keep secure backups of production secrets

## Troubleshooting

If you experience these issues, check the associated settings:

1. **Session invalidation issues:** Verify JWT_ACCESS_SECRET and JWT_REFRESH_SECRET are consistent
2. **CSRF errors:** Ensure COOKIE_SECRET is set and consistent
3. **Rate limiting not working:** Check TRUST_PROXY is correctly set
4. **IP-based features not working:** Ensure TRUST_PROXY=true when behind a proxy

## Verifying Your Configuration

Run this check on startup to verify your configuration:

```javascript
if (!process.env.JWT_ACCESS_SECRET || 
    process.env.JWT_ACCESS_SECRET.length < 32 ||
    process.env.JWT_ACCESS_SECRET === process.env.JWT_REFRESH_SECRET) {
  console.error('⚠️ WARNING: Insecure JWT configuration detected!');
  if (process.env.NODE_ENV === 'production') {
    process.exit(1); // Force configuration fix in production
  }
}
``` 