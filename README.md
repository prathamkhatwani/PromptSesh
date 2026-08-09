<div align="center">

# ⚡ PromptSesh

**The Practice & Evaluation Platform for Prompt Engineering & AI Systems**

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Gemini AI](https://img.shields.io/badge/Google-Gemini_Flash-8860D0?style=flat-square&logo=google)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

[Explore Challenges](https://github.com/prathamkhatwani/PromptSesh) • [Features](#-key-features) • [Tech Stack](#%EF%B8%8F-tech-stack) • [Getting Started](#-getting-started) • [Deployment](#-deployment)

</div>

---

## 🚀 Overview

**PromptSesh** is the premier platform built to master **Prompt Engineering, System Instructions, and LLM Guardrails**. Inspired by LeetCode, PromptSesh challenges developers, AI engineers, and prompt designers to solve real-world AI problems tested against hidden inputs, strict constraints, and automated AI judges.

Whether you're crafting zero-shot classifiers, building multi-step agentic tool calling pipelines, enforcing HIPAA compliance, or auditing code diffs for security flaws, **PromptSesh** gives you live rubric-graded feedback.

---

## ✨ Key Features

### 🏢 105+ Real-World Challenges & Enterprise Case Studies
* **9 Core Domains**: Zero-Shot, Few-Shot, Chain-of-Thought, Structured Output, Code Generation, Role Prompting, Adversarial Safety, Agents & Tool Use, and Instruction Following.
* **Flagship Enterprise Case Studies**:
  * 💳 **Apex Bank**: AI Fraud & Transaction Dispute Classifier
  * 🏥 **HealthTech Cloud**: HIPAA-Compliant Clinical Note & ICD-10 Parser
  * ☁️ **CloudScale SaaS**: Enterprise RFP Proposal Generator
  * 🛡️ **SecureDev**: Automated OWASP PR Security Auditor
  * 📦 **GlobalMart**: Multi-Carrier Logistics Dispute Resolver
  * ⚖️ **LexAI**: Legal Contract Risk Scorecard Analyzer

### 🤖 Live LLM Rubric Judging & Feedback
* Powered by **Google Gemini Flash API** (`gemini-flash-latest`).
* Evaluates submissions against multi-criteria weighted rubrics (Accuracy, Format Compliance, Security Redaction, Math Calculations).
* Detailed breakdown of scores, criteria feedback, and compilation logs.

### ✍️ Optimized Developer Workspace
* **Instant Auto-Focus**: Text cursor automatically focuses on Line 1 upon opening a challenge.
* **Variable Binding Injection**: Test case variables (`{{document}}`, `{{customerMessage}}`, `{{prDiff}}`) sit cleanly below prompt instructions.
* **Instruction Watermark Banner**: Always-visible cyan guide banner in the prompt editor box.

### 🔒 Enterprise Rate Limiting & Safety
* **Sliding Window Rate Limiter**: Integrated IP rate limiting (`src/lib/rate-limit.ts`) enforcing max 10 evaluation requests per minute to prevent API quota abuse.
* **Empty Submission Guardrails**: Client-side and server-side validation to reject placeholder text or empty submissions.

### 🏆 Progress, Streaks & Leaderboards
* **Global Leaderboard**: Live global ranking table with top 3 podium card highlights.
* **User Profile Dashboard**: Solved challenge metrics, accuracy percentage, daily streak tracker, and unlocked badge collection grid.
* **Shareable Skill Signal**: Verified achievement badges and statistics.

---

## 🛠️ Tech Stack

* **Framework**: Next.js 16 (App Router + Turbopack)
* **Language**: TypeScript
* **Styling**: Vanilla CSS + Tailwind CSS (Custom Dark Mode Glassmorphic Design Token System)
* **Generative AI Engine**: Google Generative AI SDK (`@google/genai`)
* **Database & ORM**: PostgreSQL & Prisma ORM
* **Icons**: Lucide React

---

## 💻 Getting Started

### Prerequisites
* Node.js 18.x or higher
* npm / pnpm / yarn
* A Google Gemini API Key ([Get one for free at Google AI Studio](https://aistudio.google.com/))

### Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/prathamkhatwani/PromptSesh.git
   cd PromptSesh
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/promptsesh?schema=public"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-super-secret-key"
   GOOGLE_GENERATIVE_AI_API_KEY="your-google-gemini-api-key"
   LLM_MOCK_MODE="false"
   ```

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```

5. **Open in Browser**:
   Navigate to [http://localhost:3000](http://localhost:3000) to start practicing!

---

## 🌐 Deployment

### Deploy to Vercel (Recommended)

PromptSesh is optimized for 1-click deployment on Vercel:

1. Push your repository to GitHub.
2. Go to [Vercel](https://vercel.com/new) and import `PromptSesh`.
3. Add your `GOOGLE_GENERATIVE_AI_API_KEY` to Vercel Environment Variables.
4. Click **Deploy**.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Crafted with ❤️ by **[Pratham Khatwani](https://github.com/prathamkhatwani)**

</div>
