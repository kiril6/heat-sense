# Security Measures

## Implemented Security Features

### 1. Content Security Policy (CSP)
- **What**: Restricts sources of content that can be loaded
- **Implementation**: Meta tag in index.html
- **Protection**: Prevents XSS attacks and unauthorized resource loading

### 2. Security Headers
- **X-Content-Type-Options: nosniff** - Prevents MIME type sniffing
- **X-Frame-Options: DENY** - Prevents clickjacking attacks
- **X-XSS-Protection** - Enables browser's XSS filter
- **Referrer Policy** - Controls referrer information

### 3. Input Validation
- **Device ID validation**: Regex pattern `^[a-zA-Z0-9\-_]+$`
- **Temperature data validation**: Type checking and NaN validation
- **WebSocket data validation**: Structure validation before processing

### 4. Data Sanitization
- Angular's built-in sanitization for all templates
- No use of `innerHTML`, `eval()`, or `Function()` constructor
- JSON.parse() wrapped in try-catch blocks

### 5. LocalStorage Security
- **Current**: Plain text storage (low risk - only UI preferences)
- **Data stored**: 
  - Temperature unit preference (celsius/fahrenheit)
  - Theme preference (light/dark)
  - Accessibility settings (high contrast, reduced motion)
  - Selected gauge IDs
  - View mode preference
- **Note**: No sensitive data stored

## Security Best Practices Followed

✅ No direct DOM manipulation
✅ No eval() or Function() usage
✅ No innerHTML usage
✅ Input validation on all external data
✅ Error handling with try-catch blocks
✅ HTTPS/WSS for production (configured in CSP)
✅ Type checking for all data
✅ Angular's OnPush change detection (prevents unnecessary renders)

## Recommendations for Production

### 1. Server-Side Security Headers
Add these headers in your web server configuration:

```nginx
# Nginx example
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data: https:;" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

### 2. HTTPS Only
- Enforce HTTPS in production
- Use HSTS (Strict-Transport-Security) header
- Redirect all HTTP traffic to HTTPS

### 3. API Security
- Implement rate limiting
- Add authentication tokens for API calls
- Validate API responses
- Use CORS properly

### 4. WebSocket Security
- Validate origin header
- Implement authentication for WebSocket connections
- Use secure WebSocket (wss://) only
- Add connection timeout and retry limits

### 5. Dependency Management
```bash
# Regular security audits
npm audit
npm audit fix

# Update dependencies
npm update
npm outdated
```

### 6. Environment Variables
- Never commit API keys or secrets
- Use environment variables for sensitive config
- Create `.env` file (add to .gitignore)

### 7. Build Security
```bash
# Production build with optimization
ng build --configuration production

# This enables:
# - AOT compilation
# - Minification
# - Tree shaking
# - Source map removal
```

## Vulnerability Monitoring

### Regular Checks
1. Run `npm audit` before every deployment
2. Review Angular security advisories
3. Monitor dependency updates
4. Check OWASP Top 10 compliance

### Tools
- **npm audit**: Automated dependency scanning
- **Snyk**: Continuous vulnerability monitoring
- **SonarQube**: Code quality and security analysis

## Reporting Security Issues

If you discover a security vulnerability, please email: security@example.com

## Compliance

- ✅ OWASP Top 10 compliant
- ✅ No personal data collection
- ✅ GDPR compliant (no PII stored)
- ✅ Accessibility standards (WCAG 2.1 AA)

## Security Checklist

- [x] CSP headers configured
- [x] XSS protection enabled
- [x] Input validation implemented
- [x] No innerHTML/eval usage
- [x] HTTPS/WSS enforced
- [x] Error handling in place
- [x] Data validation implemented
- [x] Angular sanitization enabled
- [ ] Server-side headers (production deployment)
- [ ] Rate limiting (API layer)
- [ ] Authentication (if required)
- [ ] Regular security audits scheduled
