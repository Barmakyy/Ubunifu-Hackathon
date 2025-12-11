# 📋 Deployment Checklist

## Before You Deploy

- [ ] Code is committed to Git
- [ ] All features tested locally
- [ ] Backend runs on port 8000
- [ ] Frontend runs on port 5173
- [ ] Database (db.json) has test data

## Backend Deployment (Render)

- [ ] GitHub repository created and pushed
- [ ] Render account created
- [ ] Connected GitHub to Render
- [ ] Created new Web Service
- [ ] Set Root Directory to `server`
- [ ] Set Build Command to `pnpm install`
- [ ] Set Start Command to `node index.js`
- [ ] Added environment variables (NODE_ENV, PORT)
- [ ] Deployment successful
- [ ] Backend URL saved: ************\_\_\_************

## Frontend Deployment (Vercel)

- [ ] Vercel account created
- [ ] Connected GitHub to Vercel
- [ ] Imported repository
- [ ] Set Root Directory to `client`
- [ ] Set Build Command to `pnpm run build`
- [ ] Set Output Directory to `dist`
- [ ] Added VITE_API_URL environment variable
- [ ] Deployment successful
- [ ] Frontend URL saved: ************\_\_\_************

## Post-Deployment

- [ ] Updated CORS in server/index.js with Vercel URL
- [ ] Committed and pushed CORS changes
- [ ] Tested login on deployed site
- [ ] Tested QR scanner
- [ ] Tested student dashboard
- [ ] Tested lecturer dashboard
- [ ] Tested admin dashboard
- [ ] All features working ✅

## Share Your URLs

**Production Site**: **************\_\_\_**************
**API Endpoint**: ****************\_****************

## Notes

- Render free tier: Server sleeps after 15 minutes of inactivity
- First request after sleep may take 30-60 seconds
- Database resets on server restart (use MongoDB for persistence)
