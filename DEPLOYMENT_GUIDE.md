# GiveWay Deployment Guide

## Deployment Platforms

### Option 1: Vercel (Recommended for Next.js)

**Pros:**
- Optimal Next.js performance
- Automatic deployments from Git
- Built-in analytics & monitoring
- Free tier available
- Instant preview deployments

**Steps:**

1. **Connect Repository**
   ```bash
   git push origin main
   ```
   Go to https://vercel.com/new and import your repository

2. **Configure Environment Variables**
   In Vercel Dashboard → Project Settings → Environment Variables:
   - `NEXT_PUBLIC_API_URL` - Your backend API URL
   - `JWT_SECRET` - Secret key for authentication
   - `GEMINI_API_KEY` - (if using AI features)

3. **Deploy**
   ```bash
   # Automatic on push to main branch
   # Or manual: npx vercel deploy --prod
   ```

4. **Visit Your Site**
   - https://your-project.vercel.app

---

### Option 2: Netlify

**Pros:**
- Simple deployment
- Good Next.js support
- Free tier
- Built-in forms & functions

**Steps:**

1. **Create netlify.toml**
   ```toml
   [build]
   command = "npm run build"
   publish = ".next"

   [[redirects]]
   from = "/*"
   to = "/index.html"
   status = 200
   ```

2. **Deploy**
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod
   ```

3. **Visit Your Site**
   - https://your-site.netlify.app

---

### Option 3: Railway.app

**Pros:**
- Simple deployment
- PostgreSQL included
- Good for full-stack apps
- GitHub integration

**Steps:**

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login & Create Project**
   ```bash
   railway login
   railway init
   ```

3. **Set Environment Variables**
   ```bash
   railway variables set NEXT_PUBLIC_API_URL=https://your-api.com
   railway variables set JWT_SECRET=your-secret
   ```

4. **Deploy**
   ```bash
   railway up
   ```

---

### Option 4: AWS Amplify

**Pros:**
- Scalable
- AWS ecosystem
- Good for larger apps
- Integrated with AWS services

**Steps:**

1. **Connect Repository**
   - Go to AWS Amplify Console
   - Click "Connect app"
   - Select your GitHub repository

2. **Configure Build Settings**
   ```yaml
   version: 1
   applications:
     - appRoot: .
       environment:
         variables:
           NODE_ENV: production
       buildCommand: npm run build
       startCommand: npm run start
   ```

3. **Deploy**
   - Automatic on push to main

---

## Pre-Deployment Checklist

### Code Quality
- [ ] `npm run typecheck` passes
- [ ] `npm run lint` has no critical errors
- [ ] `npm run build` succeeds
- [ ] No console errors in dev mode
- [ ] No sensitive data in code

### Security
- [ ] `.env.local` is in .gitignore
- [ ] All secrets in environment variables only
- [ ] CORS configured properly
- [ ] Rate limiting considered
- [ ] No hardcoded API keys

### Performance
- [ ] Lighthouse score > 90
- [ ] Images optimized
- [ ] Code splitting working
- [ ] No unused dependencies
- [ ] Bundle size reasonable

### Testing
- [ ] Key user flows tested
- [ ] Login works
- [ ] Data persists
- [ ] No broken links
- [ ] Responsive on mobile

### Configuration
- [ ] `.env.example` created
- [ ] `vercel.json` present
- [ ] `next.config.mjs` optimized
- [ ] `package.json` correct version
- [ ] Node version specified (18.x)

---

## Build & Start Commands

### Local Build Test
```bash
# Clean build
rm -rf .next
npm run build

# Start production server
npm run start

# Visit http://localhost:3000
```

### Environment-Specific Configuration

**Development (.env.local)**
```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

**Production (.env.production)**
```
NEXT_PUBLIC_API_URL=https://api.giveway.com
```

---

## Deployment Steps by Platform

### Vercel (Quickest)

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy
vercel --prod

# 3. Set environment variables
vercel env add NEXT_PUBLIC_API_URL
vercel env add JWT_SECRET

# 4. Redeploy
vercel --prod
```

### Netlify

```bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Create netlify.toml (see above)

# 3. Deploy
netlify deploy --prod --dir=.next
```

### Docker

```bash
# 1. Build image
docker build -t giveway .

# 2. Run container
docker run -p 3000:3000 giveway

# 3. Push to registry (Dockerhub, AWS ECR, etc)
docker tag giveway myregistry/giveway:latest
docker push myregistry/giveway:latest
```

---

## Environment Variables (Production)

### Required
```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
JWT_SECRET=generate-long-random-string-here
```

### Optional
```
GEMINI_API_KEY=your-key
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_ERROR_TRACKING=true
```

### How to Generate Strong JWT_SECRET
```bash
# On Mac/Linux
openssl rand -base64 32

# On Windows PowerShell
[Convert]::ToBase64String([System.Random]::new().GetBytes(32))
```

---

## Monitoring & Maintenance

### After Deployment

1. **Monitor Build Status**
   - Set up GitHub Actions for CI/CD
   - Enable automatic deployments

2. **Monitor Application**
   - Check error logs daily
   - Monitor performance metrics
   - Set up alerts for errors

3. **Regular Updates**
   - Update dependencies monthly
   - Check security advisories
   - Keep Node version current

4. **Database Maintenance** (if using backend)
   - Regular backups
   - Performance optimization
   - Growth planning

---

## Troubleshooting Deployment Issues

### Build Fails

**Error: "Cannot find module"**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Error: "TypeScript errors"**
- Check `next.config.mjs` - may have `ignoreBuildErrors: true`
- Fix actual TypeScript issues
- Run `npm run typecheck`

### Site Doesn't Load

1. Check environment variables are set
2. Check API URL is correct
3. Check CORS settings
4. Check browser console for errors
5. Check server logs

### Performance Issues

1. Analyze bundle size: `npm run build` output
2. Check Lighthouse scores
3. Enable caching headers
4. Optimize images
5. Use CDN for static assets

---

## Custom Domain Setup

### Vercel
1. Project Settings → Domains
2. Add custom domain
3. Update DNS records (see instructions in Vercel)
4. Wait for propagation (~10 mins)

### Netlify
1. Domain settings
2. Add custom domain
3. Update DNS (A and CNAME records)
4. Enable auto-SSL

### AWS Route 53
1. Create hosted zone
2. Add A record pointing to your service
3. Update domain registrar nameservers

---

## Continuous Integration / Continuous Deployment

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Use Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18.x'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run typecheck
        run: npm run typecheck
      
      - name: Run lint
        run: npm run lint
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Vercel
        run: vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
```

---

## Post-Deployment Checklist

- [ ] Site loads in browser
- [ ] Login works
- [ ] NGO discovery works
- [ ] Data persists
- [ ] Mobile responsive
- [ ] Performance acceptable
- [ ] No console errors
- [ ] Analytics working (if enabled)
- [ ] Error tracking active (if enabled)
- [ ] SSL certificate valid
- [ ] DNS propagated

---

## Cost Optimization

### Vercel
- Free tier: Sufficient for most projects
- $20/month: Enhanced security & analytics
- Pro: For production apps

### Netlify
- Free tier: 300 build minutes/month
- Pro: Unlimited builds

### Railway
- $5/month: Great for small projects
- Database included

### AWS Amplify
- Pay as you go
- Free tier: 125 minutes/month

---

## Support & Resources

- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Vercel Docs](https://vercel.com/docs)
- [Netlify Docs](https://docs.netlify.com/)
- [Railway Docs](https://docs.railway.app/)

---

## Next Steps

1. Choose deployment platform
2. Create `.env.example` file ✅ Done
3. Set up environment variables
4. Run `npm run build` to verify
5. Deploy using platform instructions
6. Test live site
7. Set up custom domain (optional)
8. Configure CI/CD (optional)

**Your application is ready to deploy! Choose a platform and follow the steps above.**
