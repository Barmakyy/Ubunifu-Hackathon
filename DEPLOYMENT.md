# Deployment Guide - Ubunifu Hackathon Project

## 📦 Prerequisites

- GitHub account
- Render account (https://render.com)
- Vercel account (https://vercel.com)
- Git installed on your computer

---

## 🔧 Step 1: Push Code to GitHub

1. **Initialize Git Repository** (if not already done):

   ```bash
   cd "C:\Users\Admin\Documents\Ubunifu Hackathon"
   git init
   git add .
   git commit -m "Initial commit - ready for deployment"
   ```

2. **Create GitHub Repository**:

   - Go to https://github.com/new
   - Name: `Ubunifu-Hackathon`
   - Set to Public or Private
   - Click "Create repository"

3. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/Ubunifu-Hackathon.git
   git branch -M main
   git push -u origin main
   ```

---

## 🚀 Step 2: Deploy Backend to Render

### Option A: Deploy from GitHub (Recommended)

1. **Go to Render Dashboard**:

   - Visit https://dashboard.render.com
   - Click "New +" → "Web Service"

2. **Connect GitHub Repository**:

   - Click "Connect GitHub"
   - Select your `Ubunifu-Hackathon` repository
   - Grant necessary permissions

3. **Configure Web Service**:

   - **Name**: `ubunifu-backend`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Build Command**: `pnpm install`
   - **Start Command**: `node index.js`
   - **Plan**: Free

4. **Environment Variables**:

   - Click "Advanced"
   - Add these variables:
     ```
     NODE_ENV = production
     PORT = 8000
     ```

5. **Deploy**:
   - Click "Create Web Service"
   - Wait 5-10 minutes for deployment
   - Copy the deployment URL (e.g., `https://ubunifu-backend.onrender.com`)

### Option B: Manual Deploy

If you don't want to use GitHub:

1. Click "New +" → "Web Service"
2. Select "Deploy from Git"
3. Paste repository URL
4. Follow steps 3-5 above

---

## 🌐 Step 3: Deploy Frontend to Vercel

1. **Go to Vercel Dashboard**:

   - Visit https://vercel.com/dashboard
   - Click "Add New..." → "Project"

2. **Import Git Repository**:

   - Click "Import Git Repository"
   - Select your `Ubunifu-Hackathon` repository
   - Click "Import"

3. **Configure Project**:

   - **Framework Preset**: Vite
   - **Root Directory**: `client` (Click "Edit" and set this)
   - **Build Command**: `cd client && pnpm install && pnpm run build`
   - **Output Directory**: `client/dist`
   - **Install Command**: Leave empty or `pnpm install`

   **Alternative if above doesn't work:**

   - **Root Directory**: Leave as `.` (project root)
   - **Build Command**: `cd client && pnpm install && pnpm run build`
   - **Output Directory**: `client/dist`
   - **Install Command**: `cd client && pnpm install`

4. **Environment Variables**:

   - Click "Environment Variables"
   - Add variable:
     ```
     VITE_API_URL = https://ubunifu-backend.onrender.com
     ```
   - Replace with YOUR Render backend URL from Step 2

5. **Deploy**:
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your app will be live at `https://your-project.vercel.app`

---

## ⚙️ Step 4: Update CORS Settings (Important!)

After deployment, you need to update the backend CORS to allow your Vercel frontend:

1. **Edit server/index.js**:
   Add your Vercel URL to allowed origins:

   ```javascript
   const corsOptions = {
     origin: [
       "http://localhost:5173",
       "https://your-project.vercel.app", // Add your Vercel URL
     ],
     credentials: true,
   };
   server.use(cors(corsOptions));
   ```

2. **Commit and Push**:

   ```bash
   git add server/index.js
   git commit -m "Update CORS for production"
   git push
   ```

3. Render will automatically redeploy with new settings

---

## ✅ Step 5: Verify Deployment

1. **Test Backend**:

   - Visit: `https://your-backend.onrender.com/users`
   - Should see JSON data

2. **Test Frontend**:
   - Visit your Vercel URL
   - Try logging in
   - Test QR scanning
   - Check all features work

---

## 🔄 Updating Your Deployment

### For Backend Changes:

```bash
cd server
git add .
git commit -m "Update backend"
git push
```

Render will auto-deploy in 2-3 minutes

### For Frontend Changes:

```bash
cd client
git add .
git commit -m "Update frontend"
git push
```

Vercel will auto-deploy in 1-2 minutes

---

## 🐛 Troubleshooting

### Backend Issues:

- Check Render logs: Dashboard → Your Service → Logs
- Verify PORT environment variable is set
- Check database file (db.json) exists

### Frontend Issues:

- Check Vercel logs: Dashboard → Your Project → Deployments → View Logs
- Verify VITE_API_URL is set correctly
- Check browser console for CORS errors

### CORS Errors:

- Add your Vercel URL to CORS allowlist in server/index.js
- Redeploy backend after changes

### Database Resets:

- Render free tier resets on inactivity
- Consider upgrading or using external database (MongoDB, PostgreSQL)

---

## 📊 Important Notes

1. **Free Tier Limitations**:

   - Render: Spins down after 15min inactivity (first request may be slow)
   - Vercel: 100GB bandwidth/month
   - Both: Automatic SSL certificates

2. **Database Persistence**:

   - JSON Server data resets on Render restart
   - For production, migrate to MongoDB or PostgreSQL

3. **Custom Domains**:

   - Both platforms support custom domains
   - Configure in respective dashboards

4. **Environment Variables**:
   - Never commit .env files
   - Always use platform environment variables

---

## 🎉 Your URLs

After deployment, save these URLs:

- **Backend**: https://ubunifu-backend.onrender.com
- **Frontend**: https://your-project.vercel.app

Share the frontend URL with users!

---

## 📝 Next Steps for Production

1. **Use Real Database**:

   - MongoDB Atlas (free tier)
   - PostgreSQL on Render
   - Supabase

2. **Add Authentication**:

   - JWT tokens
   - OAuth providers

3. **Monitoring**:

   - Sentry for error tracking
   - Analytics (Google Analytics, Plausible)

4. **Performance**:
   - CDN for static assets
   - Image optimization
   - Code splitting

---

Need help? Check:

- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- Your GitHub Issues tab
