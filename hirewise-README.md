# HireWise — AI-Powered Recruitment Platform

> **Assignment:** AI-Powered Recruitment Experience  
> **Timeline:** 5 days  
> **Demo Login:** hire-me@anshumat.org / HireMe@2025!

---

## 🎯 Problem Understanding

### What's wrong with resume-based hiring?

Traditional hiring is broken in three key ways:

1. **Format bias over substance** — Candidates with poor design skills or non-standard career paths are penalized before a human even reads their content.
2. **Inconsistent data** — Every resume has different structures, making automated parsing lossy and recruiter comparison error-prone.
3. **Gatekeeping by polish** — A fresher who doesn't know how to format a one-pager loses to someone with identical skills who happened to find a better template.

### What does AI solve here?

| Old problem | AI solution |
|---|---|
| Candidates don't know what to highlight | AI prompts them with the right questions |
| Recruiters spend 6s skimming PDFs | AI generates structured summaries + match scores |
| Parsing errors from PDF OCR | No PDF — data is structured from the start |
| Inconsistent skill naming | AI normalizes ("ReactJS" → "React") |
| Bias from resume design | Uniform profiles strip formatting advantage |

---

## 🗺 User Flows

### Candidate Flow
```
Landing → Sign Up → AI Onboarding → Profile Builder
  ├── Basics (AI chat input)
  ├── Experience (AI chat input)
  ├── Skills (AI suggestions + manual)
  ├── Projects (AI extraction)
  └── Education (AI chat input)
→ Profile Preview → Publish → Share Link / Download PDF
```

### Recruiter Flow
```
Sign Up (as Recruiter) → Recruiter Dashboard
  ├── Candidate Pool (grid view, filters)
  ├── Open Profile Modal (AI analysis, skills, projects)
  ├── Shortlist / Pass actions
  └── AI Compare (2–3 candidates side-by-side)
```

---

## 🏗 Information Architecture

```
Candidate Profile
├── Basics
│   ├── name
│   ├── targetRole
│   ├── location
│   ├── availability
│   └── oneLiner
├── Experience[]
│   ├── company, role, start, end
│   ├── achievement (AI-extracted)
│   └── techStack
├── Skills[]
│   ├── name
│   └── level (beginner/intermediate/advanced)
├── Projects[]
│   ├── name, description, impact
│   ├── techStack[]
│   └── tag
├── Education[]
│   ├── degree, institution, year, gpa
│   └── achievement
└── Meta
    ├── aiSummary (generated)
    ├── profileLink
    ├── completion %
    └── lastSaved
```

---

## ⚡ AI Interaction Design

### Core Pattern: "Tell me → I'll structure it"

Every section uses a **conversational AI input** instead of a form:

```
User: "I interned at TechStartup last summer for 3 months.
       I built dashboards using React, worked with the design
       team on Figma files, and helped reduce manual reporting."

AI →  {
        company: "TechStartup",
        role: "Frontend Intern",
        duration: "Jun–Aug 2024 (3 months)",
        achievement: "Built 3 React dashboards, reducing
                      manual reporting time significantly",
        tech: ["React", "Figma"]
      }
```

### AI features by section

| Section | AI Behaviour |
|---|---|
| Basics | Natural language → structured JSON |
| Experience | Extracts role, company, dates, achievements |
| Skills | Suggests skills based on described experience |
| Projects | Extracts name, tech stack, impact from description |
| Education | Parses institution, degree, CGPA, achievements |
| Summary | Auto-generates a 3-sentence professional bio |
| Recruiter view | Generates candidate fit analysis + personality traits |

---

## 🖥 Screens (6–8 required → 7 delivered)

| # | Screen | Route |
|---|---|---|
| 1 | Landing / Hero | `/` |
| 2 | Auth (Sign Up + Log In) | `/auth` |
| 3 | AI Onboarding | `/onboarding` |
| 4 | AI Profile Builder | `/builder` |
| 5 | Profile Preview | `/preview` |
| 6 | Recruiter Dashboard | `/recruiter` |
| 7 | Confirmation + Share | `/confirm` |

---

## 💾 Save / Sync Features

- **Auto-save toast** appears every 30 seconds and after each AI action
- **Progress bar** in sidebar shows % completion across 5 sections
- Section items marked with **✓ Done** when accepted
- Profile state persists in memory (add localStorage for persistence)

---

## 📤 Export / Share

- **Download PDF** button on Preview and Confirm screens
- **Profile link** generated on confirmation: `hirewise.app/u/[name-slug]`
- **Copy link** button with instant feedback

---

## 🛠 Tech Stack

| Layer | Tech | Justification |
|---|---|---|
| Frontend | HTML / CSS / Vanilla JS | Zero-dependency, fast load, full control over custom design system |
| Backend | Node.js + Express | Lightweight REST API, easy to extend |
| AI | Anthropic Claude API (claude-sonnet-4-20250514) | Best-in-class structured output extraction |
| Storage | In-memory (extendable to MongoDB/PostgreSQL) | Simple for demo; schema designed for easy DB migration |
| Fonts | Syne + DM Sans (Google Fonts) | Distinctive, modern pairing — avoids generic AI-app aesthetic |

### Why no React/Vue?
For a single-page recruitment app where routing is minimal and the AI interaction is the core UX, vanilla JS keeps the bundle tiny and the design fully customizable. Adding a framework would add overhead without clear benefit at this scope.

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js v18+
- npm v9+

### 1. Clone the repo
```bash
git clone https://github.com/your-username/hirewise.git
cd hirewise
```

### 2. Install backend dependencies
```bash
cd backend
npm install
```

### 3. Set environment variables (optional — for live AI)
```bash
# backend/.env
ANTHROPIC_API_KEY=your_key_here
PORT=3000
```
> Without `ANTHROPIC_API_KEY`, the app works with pre-seeded mock AI responses.

### 4. Start the server
```bash
npm start
# or for development with hot reload:
npm run dev
```

### 5. Open in browser
```
http://localhost:3000
```

---

## 🔐 Demo Login

| Field | Value |
|---|---|
| Email | hire-me@anshumat.org |
| Password | HireMe@2025! |
| Role | Candidate (pre-seeded profile) |

> This user has a fully seeded profile so reviewers can see all screens without going through the full builder flow.

To access the **recruiter view** directly: click "For Recruiters" on the landing page, or sign up with role = Recruiter.

---

## 📁 Project Structure

```
hirewise/
├── frontend/
│   └── index.html          # Complete SPA — all 7 screens
├── backend/
│   ├── server.js           # Express API (auth, profiles, AI proxy)
│   └── package.json
└── README.md
```

---

## 📊 Evaluation Coverage

| Criterion | Weight | Implementation |
|---|---|---|
| UX Thinking | 25% | 7 screens with clear flows, sidebar navigation, progress tracking |
| AI Interaction Design | 20% | Natural language → structured JSON for every section |
| Problem Solving | 20% | No PDF upload anywhere in the flow |
| Product Thinking | 15% | Auto-save, progress bar, export, shareable link |
| Visual Design | 10% | Custom design system: Syne + DM Sans, lime/violet palette, grain texture |
| Originality | 10% | Conversational AI input pattern — not LinkedIn/Naukri clone |

---

## ✅ Requirements Checklist

- [x] No resume upload flow
- [x] AI-assisted profile builder
- [x] Structured data capture
- [x] User onboarding with AI introduction
- [x] 6–8 core screens (7 delivered)
- [x] Auto-save + progress tracking
- [x] Export (PDF button) + share profile link
- [x] Recruiter view with shortlist actions
- [x] Demo login seeded and working
- [x] GitHub-ready structure with README
