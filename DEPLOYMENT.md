# 🌐 PromptSesh Production Deployment Guide

Follow this simple guide to deploy **PromptSesh** to production on **Vercel** with a free **PostgreSQL Database (Supabase / Neon)**.

---

## 📋 Prerequisites
- A **GitHub Account** (with repository [`PromptSesh`](https://github.com/prathamkhatwani/PromptSesh))
- A free **[Vercel](https://vercel.com)** account
- A free **[Supabase](https://supabase.com)** or **[Neon](https://neon.tech)** PostgreSQL database
- A free **[OpenRouter API Key](https://openrouter.ai)** or **[Google AI Studio Key](https://aistudio.google.com)**

---

## Step 1: Create a Cloud PostgreSQL Database
1. Sign in to **[Neon.tech](https://neon.tech)** or **[Supabase](https://supabase.com)**.
2. Create a new project named `PromptSesh`.
3. Copy your Connection String (`DATABASE_URL`).
   - Example (Neon): `postgresql://user:password@ep-cool-name.us-east-2.aws.neon.tech/promptsesh?sslmode=require`

---

## Step 2: Deploy to Vercel
1. Go to **[Vercel Dashboard](https://vercel.com/new)** and click **Add New Project**.
2. Select your GitHub repository **`PromptSesh`**.
3. In **Environment Variables**, add the following:

| Key | Example Value | Notes |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://...` | Your Neon / Supabase connection URL |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` | Production domain URL |
| `NEXTAUTH_SECRET` | `generate-random-secret-key` | Random 32+ char string |
| `AUTH_SECRET` | `generate-random-secret-key` | Random 32+ char string |
| `OPENROUTER_API_KEY` | `sk-or-v1-...` | Free tier model key (`Llama 3.3 70B` & `Gemini 2.0 Flash`) |
| `GOOGLE_GENERATIVE_AI_API_KEY` | `AIzaSy...` | Optional direct Gemini key |

4. Click **Deploy**. Vercel will automatically build and publish the app!

---

## Step 3: Run Database Migrations & Seed Data
Once deployed, populate the cloud database with all 16 challenges and rubric criteria:

Run locally on your terminal connected to the cloud DB:
```bash
npx prisma db push
npx prisma db seed
```

---

## ⚡ Deployment Complete!
Your application is live and ready for real users with native account signup, password hashing, and free multi-model evaluation!
