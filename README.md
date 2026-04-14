# ResumeForge - AI-Powered Resume Builder 🚀

ResumeForge is a highly dynamic, client-side, single-page application (SPA) that acts as an intelligent, AI-powered toolkit for job seekers. It uses responsive Glassmorphism design and the Groq AI API (LLaMA-3) to not just build a resume, but actively engineer it toward your career goals.

## 🌟 Features

- **Dynamic Role-Based Profiles:** Select whether you're a *Fresher (Technical)*, *Fresher (Non-Tech)*, or *Experienced Pro*. The system automatically reshuffles the layout and form input priority to emphasize what recruiters look for in your specific track.
- **AI Content Improvement:** Plug in your Groq API key and the AI will auto-rewrite your bullet points to be punchy, quantified, and action-oriented. 
- **Auto-Summary & Skill Suggestions:** The AI can instantly synthesize a Professional Summary from your experience and suggest a dozen high-impact skills based on your Target Job Title.
- **ATS Match Evaluator:** Paste a target Job Description into the *Analyze ATS* modal. The AI will cross-reference your JSON resume state and return an ATS Match %, pinpoint missing keywords, and provide an actionable auto-suggestion checklist for low scores.
- **Dynamic CSS Templates:** 
  - Executive Classic (Single Column)
  - Modern Left Split
  - Professional Right Split
- **Theme Support:** Switch between Emerald, Slate, Blue, Pink, and Orange accents on the fly.
- **Export to PDF:** Powered by `html2pdf.js` to render the DOM cleanly into an A4 document.

## 🛠 Tech Stack
- **Architecture:** Pure Vanilla HTML5, CSS3, JavaScript (0 backend required).
- **AI Model:** Groq API `llama-3.3-70b-versatile`
- **Libraries:**
  - `html2pdf.js` - Client-side PDF rendering.
  - `canvas-confetti` - Download celebration effects.
  - FontAwesome (CDN) - Iconography.
  - Google Fonts (Cormorant Garamond, IBM Plex Mono).

## 🚀 Getting Started

Since ResumeForge is a fully client-side application, running it locally is incredibly simple.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Muskan6122005/ResumeForge-an-AI-powered-resume-builder.git
   ```
2. **Open index.html:**
   Simply double-click `index.html` or serve it using Live Server in VS Code.
3. **Configure API:**
   Click the gear icon (⚙️) in the top right to open settings and configure your Groq API Key. It will be stored securely in your browser's `localStorage`.

## 🎨 Design System
The UI utilizes a **"Corporate Glassmorphism"** philosophy: deep slate backgrounds intertwining with mesh gradients, frosted glass component panels, and clean elegant typography designed to look like a premium SaaS platform.
