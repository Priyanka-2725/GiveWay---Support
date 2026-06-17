# GiveWay - Production Checklist

## Pre-Deployment Tasks

### 🔍 Code Quality

- [ ] **Build Test**
  ```bash
  npm run build
  npm run start
  # Visit http://localhost:3000
  ```

- [ ] **Type Check**
  ```bash
  npm run typecheck
  ```

- [ ] **Lint Check**
  ```bash
  npm run lint
  ```

- [ ] **No Console Errors**
  - Test all major user flows
  - Check browser DevTools console
  - Verify no unhandled errors

### 🔐 Security

- [ ] **No Hardcoded Secrets**
  - Remove API keys from code
  - Remove passwords from code
  - Remove credentials from .env

- [ ] **Environment Variables**
  - Create `.env.example`
  - Document all required vars
  - Use `.env.production` for prod

- [ ] **CORS Configuration**
  - Verify API domain whitelist
  - Test API calls from production domain

- [ ] **No Sensitive Data in Logs**
  - No passwords in console.logs
  - No tokens in error messages

### 📊 Performance

- [ ] **Lighthouse Check**
  ```bash
  # Chrome DevTools → Lighthouse
  # Target: All scores > 90
  ```

- [ ] **Bundle Size**
  - Check build output for warnings
  - Identify and remove unused code

- [ ] **Image Optimization**
  - All images use Next.js Image component
  - Images are appropriately sized
  - Verify responsive images work

- [ ] **Code Splitting**
  - Pages load quickly
  - No large JavaScript bundles
  - Lazy loading implemented

### 🧪 Testing

- [ ] **Core Flows**
  - [ ] User can login
  - [ ] User can view NGOs
  - [ ] User can make donation
  - [ ] Data persists after refresh
  - [ ] Admin can verify NGOs
  - [ ] NGO admin can manage operations

- [ ] **Mobile Responsive**
  - [ ] Desktop: 1920px+
  - [ ] Tablet: 768px
  - [ ] Mobile: 375px
  - [ ] Touch interactions work

- [ ] **Browser Compatibility**
  - [ ] Chrome latest
  - [ ] Firefox latest
  - [ ] Safari latest
  - [ ] Edge latest

- [ ] **Network Conditions**
  - [ ] Works on 4G
  - [ ] Works on WiFi
  - [ ] Handles slow network
  - [ ] Offline mode graceful

### 📋 Configuration

- [ ] **Environment Setup**
  - [ ] `.env.example` created
  - [ ] `.env.local` ignored in git
  - [ ] Production `.env` ready

- [ ] **Build Configuration**
  - [ ] `next.config.mjs` optimized
  - [ ] `vercel.json` present
  - [ ] `package.json` correct

- [ ] **Node Version**
  - [ ] Specify Node 18.x
  - [ ] Test with target version

- [ ] **.gitignore**
  - [ ] `.env.local` ignored
  - [ ] `.env` ignored
  - [ ] `node_modules` ignored
  - [ ] `.next` ignored

### 📦 Dependencies

- [ ] **No Unused Packages**
  ```bash
  npm list --depth=0
  ```

- [ ] **Security Audit**
  ```bash
  npm audit
  npm audit fix
  ```

- [ ] **Up-to-date Dependencies**
  ```bash
  npm outdated
  npm update
  ```

### 📄 Documentation

- [ ] **README Updated**
  - [ ] Installation instructions
  - [ ] Development setup
  - [ ] Deployment instructions
  - [ ] Environment variables documented

- [ ] **Deployment Guide Ready**
  - [ ] Platform-specific instructions
  - [ ] Environment variable setup
  - [ ] Custom domain instructions

### 🚀 Platform-Specific

#### Vercel
- [ ] `.github` configured for deployments
- [ ] Preview deployments working
- [ ] Production domain set
- [ ] SSL certificate active

#### Netlify
- [ ] `netlify.toml` present
- [ ] Build settings configured
- [ ] Redirects configured
- [ ] Domain configured

#### Docker
- [ ] `Dockerfile` optimized
- [ ] `docker-compose.yml` working
- [ ] Docker builds successfully
- [ ] Container runs without errors

---

## Environment Variable Setup

### Copy Template
```bash
cp .env.example .env.production
```

### Production Environment Variables
```bash
# API
NEXT_PUBLIC_API_URL=https://api.your-domain.com

# Security
JWT_SECRET=[generate 32-char random string]

# Optional
GEMINI_API_KEY=[your-key-if-using]
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

---

## Deployment Checklist by Platform

### ✅ Vercel

```bash
# 1. Install CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel --prod

# 4. Set environment
vercel env add NEXT_PUBLIC_API_URL
vercel env add JWT_SECRET

# 5. Redeploy
vercel --prod
```

**Verify:**
- [ ] Build succeeded
- [ ] Preview URL works
- [ ] Production URL set
- [ ] Environment vars present

### ✅ Netlify

```bash
# 1. Install CLI
npm install -g netlify-cli

# 2. Create netlify.toml (see DEPLOYMENT_GUIDE.md)

# 3. Deploy
netlify deploy --prod

# 4. Set environment
netlify env:set NEXT_PUBLIC_API_URL https://api.your-domain.com
netlify env:set JWT_SECRET [your-secret]
```

**Verify:**
- [ ] Build completed
- [ ] Site deployed
- [ ] Environment vars set
- [ ] DNS configured

### ✅ Railway.app

```bash
# 1. Install CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Create project
railway init

# 4. Set variables
railway variables set NEXT_PUBLIC_API_URL=https://...
railway variables set JWT_SECRET=...

# 5. Deploy
railway up
```

**Verify:**
- [ ] Project created
- [ ] Deployed successfully
- [ ] Environment vars set
- [ ] Public URL generated

---

## Post-Deployment Testing

### 🌐 Site Accessibility

```bash
# Test site loads
curl -I https://your-domain.com

# Verify SSL certificate
openssl s_client -connect your-domain.com:443

# Check DNS
nslookup your-domain.com
```

### 🔗 Functionality Testing

- [ ] Homepage loads
- [ ] Navigate to /discover
- [ ] Navigate to /login
- [ ] Can log in
- [ ] Can view NGOs
- [ ] Can view NGO details
- [ ] Can navigate to /dashboard
- [ ] localStorage persists data

### 📊 Performance Testing

```bash
# Lighthouse (in Chrome DevTools)
- Accessibility: > 90
- Best Practices: > 90
- Performance: > 90
- SEO: > 90
```

### 🔐 Security Testing

- [ ] HTTPS enforced (no HTTP)
- [ ] SSL certificate valid
- [ ] No insecure API calls
- [ ] No sensitive data in URLs
- [ ] CORS headers correct

### 📱 Responsive Testing

Test on:
- [ ] Desktop (1920px)
- [ ] Laptop (1366px)
- [ ] Tablet (768px)
- [ ] Mobile (375px)

---

## Monitoring & Maintenance

### Daily
- [ ] Check error logs
- [ ] Verify site loads
- [ ] Check API connectivity

### Weekly
- [ ] Review analytics
- [ ] Check performance metrics
- [ ] Monitor uptime

### Monthly
- [ ] Update dependencies
- [ ] Review security advisories
- [ ] Check error rates
- [ ] Optimize performance

### Quarterly
- [ ] Major version updates
- [ ] Performance review
- [ ] Security audit
- [ ] Capacity planning

---

## Rollback Plan

### If Deployment Fails

1. **Check Build Logs**
   - Platform dashboard → build logs
   - Identify error message

2. **Verify Locally**
   ```bash
   npm run build
   npm run start
   ```

3. **Revert to Last Working Version**
   ```bash
   git revert HEAD
   git push
   ```

4. **Redeploy**
   - Platform will auto-deploy on push

### If Site Has Errors

1. **Check Browser Console**
   - DevTools → Console tab
   - Note error messages

2. **Check Environment Variables**
   - Platform dashboard → settings
   - Verify all required vars present

3. **Check API Connection**
   - Verify `NEXT_PUBLIC_API_URL` correct
   - Test API endpoint directly

4. **Revert to Last Stable**
   ```bash
   git revert HEAD
   git push
   ```

---

## Success Indicators ✅

After deployment, verify:

- [x] Site loads without errors
- [x] All pages accessible
- [x] Login works correctly
- [x] Data persists across refreshes
- [x] Mobile responsive
- [x] Performance good (Lighthouse > 90)
- [x] SSL certificate valid
- [x] No console errors
- [x] API calls working
- [x] Analytics tracking (if enabled)

---

## Important Notes

### Environment Variables
- Never commit `.env` files
- Use platform's environment variable UI
- Test locally before deploying
- Update when changing API URLs

### Database (if using backend)
- Ensure database is running
- Verify connection string correct
- Test database queries work
- Have backup strategy

### Custom Domain
- DNS can take 24-48 hours to propagate
- Verify DNS records correct
- Force browser cache clear
- Use different browser to test

---

## Additional Resources

- [Next.js Production Checklist](https://nextjs.org/learn/foundations/how-nextjs-works)
- [Vercel Deployment Guide](https://vercel.com/docs/deployments/overview)
- [Netlify Deployment Guide](https://docs.netlify.com/get-started/get-deploy-ready/)
- [Security Best Practices](https://owasp.org/www-project-top-ten/)

---

## Deployment Completed ✅

After going through this checklist:

1. Your application is production-ready
2. All security checks passed
3. Performance optimized
4. Fully tested and verified
5. Ready for live users

**Deploy with confidence!**
