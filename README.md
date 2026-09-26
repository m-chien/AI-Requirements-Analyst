# 🤖 AI Requirements Analyst

> An AI-assisted Business Analysis tool that transforms raw stakeholder inputs into clear, structured, and reviewable software requirements.

**Core Principle:** AI assists the analysis process, but the **Business Analyst (BA)** remains in control—responsible for reviewing, editing, accepting, or rejecting AI-generated results.

---

## 🎯 Problem vs. Solution

### ❌ The Problem
Requirements are rarely clean. Business Analysts often spend countless hours manually:
- Reading unstructured meeting notes, emails, and chat messages.
- Extracting requirements and identifying actors/modules.
- Finding conflicts, ambiguities, and missing information.
- Converting raw text into User Stories and Acceptance Criteria.
- Analyzing impact when new requirements are added.

### ✅ The Solution
A structured workflow powered by LLMs (e.g., Gemini API) to automate the heavy lifting:
- **Parse & Normalize:** Automatically extract and classify requirements from raw text.
- **Detect Issues:** Flag conflicts, ambiguities, and missing data.
- **Generate:** Create User Stories, Acceptance Criteria, and smart clarification questions.
- **Review:** A strict *Human-in-the-Loop* design where BAs validate and finalize all AI outputs.

---

## ✨ Core Capabilities

- 📄 **Requirement Extraction & Normalization**: Converts messy notes into clear business rules.
- 🎭 **Actor Identification**: Automatically detects personas (e.g., Employee, Executive, Admin).
- ⚠️ **Conflict & Ambiguity Detection**: Flags contradictory or vague stakeholder statements.
- ❓ **Missing Info & Questions**: Generates smart questions to fill logical gaps.
- 📖 **User Story Generation**: Auto-creates formatted stories and acceptance criteria.
- 🔄 **Change Impact Analysis**: Evaluates how new requirements affect existing ones.

---

## 🔄 Human-in-the-Loop Workflow

The system never assumes AI is 100% correct. Every output has a status:  
`PENDING` ➡️ `EDITED` ➡️ `APPROVED` (or `REJECTED`)

```text
Raw Input ➔ AI Analysis ➔ Structured Result ➔ 🧑‍💻 BA Review ➔ Approved Requirements
```

---

## 🛠️ Technology Stack

**Frontend:**  
![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

**Backend:**  
![Java](https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

**AI & Tools:**  
![Gemini API](https://img.shields.io/badge/Gemini_API-8E75B2?style=for-the-badge)
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)

---

## 🚀 Getting Started

### Prerequisites
- Java 21+ | Node.js 20+ | PostgreSQL | Maven

### 1. Backend Setup
```bash
cd backend

# Configure environment variables or application.yml:
# DB_URL=jdbc:postgresql://localhost:5432/ai_requirements
# DB_USERNAME=postgres
# DB_PASSWORD=your_password
# GEMINI_API_KEY=your_api_key

./mvnw spring-boot:run
# Server runs on http://localhost:8080
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# App runs on http://localhost:3000
```
*(Note: Create a `.env.local` with `NEXT_PUBLIC_API_BASE_URL=http://localhost:8080`)*

---

## 📂 Project Structure

```text
ai-requirements-analyst/
├── frontend/          # Next.js, TS, Tailwind UI components & pages
├── backend/           # Spring Boot REST API, AI integration & services
├── docs/              # Architecture, User Flow, AI Worklog
├── samples/           # Sample raw inputs & requirement changes
└── README.md
```

---

## 🔌 API Design (Sneak Peek)

The backend handles AI communication, expecting strict JSON outputs. Example endpoints:
- `POST /api/requirements/analyze` - Parses raw text into structured JSON.
- `PATCH /api/requirements/{id}/review` - BA accepts/edits an AI result.
- `POST /api/requirements/impact` - Evaluates how a new requirement affects the system.

---

## 📝 AI Usage & Worklog

AI acts strictly as an **assistant**. We focus on prompt quality, structured JSON outputs, and human traceability.  
All AI prompt experiments, hallucination fixes, and workflow improvements are documented in the **AI_WORKLOG.md**.

**Example Log:**
> **Problem:** AI assumed executives are exempt from booking rules.  
> **Fix:** Updated prompt to force AI to *flag* uncertain conflicts instead of auto-resolving them.

---

## ✅ Development Checklist

- [ ] Raw requirement input & AI extraction
- [ ] Actor & Requirement Classification
- [ ] Conflict, Ambiguity & Missing Info Detection
- [ ] User Story & Acceptance Criteria Generation
- [ ] BA Review Workflow (Accept/Edit/Reject)
- [ ] Change Impact Analysis
- [ ] PostgreSQL Database Persistence
- [ ] Demo Video & Deployment

---

## 🔮 Future Enhancements
- 🎙️ Speech-to-text requirement ingestion (Meeting recordings).
- 📚 RAG (Retrieval-Augmented Generation) over existing requirement documents.
- 🔗 Jira integration to push approved User Stories.
- 👥 Multi-project workspaces & role collaboration (Product, Dev, QA).

---

👤 **Author:** Tran Minh Chien  
🎓 *Information Technology Student | University of Technology and Education – The University of Danang*