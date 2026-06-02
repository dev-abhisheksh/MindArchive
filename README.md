# 🧠 MindArchive — AI-Powered Knowledge Management & Semantic Discovery

![Status](https://img.shields.io/badge/Status-Active%20Development-blue)
![Node.js](https://img.shields.io/badge/Node.js-43853D?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?logo=mongodb&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-Caching%20%26%20Queues-red)
![AI](https://img.shields.io/badge/AI-Gemini%20%7C%20Groq-purple)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?logo=tailwind-css&logoColor=white)

**MindArchive** is a "Second Brain" application designed to help you capture, organize, and discover connections between your digital bookmarks, notes, and media. Unlike traditional bookmark managers, MindArchive uses **Vector Embeddings** and **LLMs** to understand the semantic meaning of your content, creating a navigable graph of your knowledge.

---

## 🎯 What This Project Demonstrates

This project is a full-stack showcase of modern engineering patterns, focusing on **AI integration**, **background processing**, and **secure data management**.

It demonstrates:
- **Asynchronous AI Pipelines**: Content processing (summarization, tagging, embedding) handled via background workers.
- **Semantic Similarity**: Automatic discovery of related content using vector space distances.
- **Knowledge Graph Visualization**: Interactive 2D/3D graph views to visualize connections between ideas.
- **Defensive Security**: Multi-tier authentication including a PIN-protected Private Vault.
- **Scalable Architecture**: Strict separation of concerns between API, Worker, and Service layers.
- **Performance Optimization**: Advanced caching strategies for AI outputs to minimize latency and API costs.

---

## 🚀 Core Features

### 🔐 Multi-Tier Security
- **JWT-Based Authentication**: Secure login and session management.
- **OTP Verification**: Email-based verification via Brevo.
- **Private Vault**: A secondary security layer requiring a **4-digit PIN** to access sensitive content.
- **Temporary Access**: Vault verification is cached in Redis with a 5-minute TTL for a seamless but secure experience.

### 🧠 AI-Driven Content Engine
MindArchive doesn't just save links; it understands them.
- **Automated Summarization**: Extracts the essence of articles and videos using Gemini/Groq.
- **Intelligent Tagging**: AI generates relevant tags for organization.
- **Vector Embeddings**: Converts text into mathematical vectors for high-precision semantic search.
- **Semantic Discovery**: Automatically links new content to existing items in your archive based on similarity.

### 🕸️ Semantic Graph View
- **Interactive Visualization**: Explore your "Second Brain" through a force-directed graph.
- **Jaccard Similarity**: Graph edges are enriched with similarity scores based on shared tags.
- **Cross-Discovery**: Find hidden connections between disparate topics that you might have missed.

### ⚡ Production-Grade Infrastructure
- **BullMQ & Redis**: Reliable task queuing for long-running AI processes.
- **Distributed Worker**: A dedicated background worker process handles heavy lifting, keeping the API responsive.
- **Multi-Layer Caching**: Redis caches everything from AI summaries and embeddings to Jaccard similarity scores.
- **Cloudinary Integration**: Secure storage for user avatars and media assets.

---

## 🧠 Tech Stack

### Frontend
- **Framework:** React 19 (Vite)
- **Styling:** Tailwind CSS v4, Styled Components
- **State/Routing:** React Router 7, Axios
- **Visualization:** React Force Graph (2D/3D), Lucide Icons
- **Deployment:** Vercel

### Backend
- **Runtime:** Node.js (Express 5)
- **Database:** MongoDB + Mongoose
- **Task Queue:** BullMQ
- **Caching:** Redis (ioredis)
- **AI Integration:** Google Gemini, Groq SDK
- **Communication:** Brevo (Email), Cloudinary (Images)

---

## 📁 Project Structure

```text
MindArchive/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── api/           # API Service Layer (Axios)
│   │   ├── components/    # Reusable UI Components
│   │   ├── layout/        # Layout Wrappers
│   │   ├── pages/         # View Components (Dashboard, Graph, Vault)
│   │   └── hooks/         # Custom React Hooks
│
└── service/                # Node.js Backend
    ├── src/
    │   ├── controllers/   # Request Logic (Auth, Content, Vault)
    │   ├── services/      # AI & 3rd Party Logic (Gemini, Embeddings)
    │   ├── workers/       # BullMQ Background Processors
    │   ├── queues/        # Task Queue Definitions
    │   ├── models/        # Mongoose Schemas (Content, RelatedContent)
    │   ├── routes/        # API Endpoints
    │   └── middlewares/   # Auth & Vault Protection
    ├── server.js          # API Entry Point
    └── reprocessRelations.js # Utility Script for Semantic Linkage
```

---

## ⚙️ Environment Variables

### Service (.env)
| Variable | Description |
|--------|-------------|
| `PORT` | API Server Port |
| `MONGODB_URL` | MongoDB Connection String |
| `JWT_SECRET` | Secret for Auth Tokens |
| `REDIS_URL` | Redis Instance URL |
| `GEMINI_API_KEY` | Google Gemini API Key |
| `GROQ_API_KEY` | Groq API Key |
| `BREVO_API_KEY` | Email Service API Key |
| `CLOUDINARY_URL` | Asset Storage Config |

---

## 📡 API Overview (Key Endpoints)

### Content Management
- `POST /api/content` - Add new content (triggers AI pipeline)
- `GET /api/content/my` - Fetch user's public archive
- `GET /api/graphs` - Fetch semantic graph nodes and edges

### Secure Vault
- `POST /api/vault/set-pin` - Initialize private vault
- `POST /api/vault/verify` - Temporary unlock for session
- `PATCH /api/vault/toggle/:id` - Move content in/out of vault

---

## 🧪 Future Roadmap
- [ ] Browser extension for one-click archiving.
- [ ] Vector-based semantic search bar.
- [ ] Multi-format support (PDF, Audio transcriptions).
- [ ] Collaborative collections with RBAC.

---

## 👨‍💻 Author

**Abhishek Sharma**  
Full-Stack Developer | AI Enthusiast  
GitHub: [https://github.com/dev-abhisheksh](https://github.com/dev-abhisheksh)

---

⭐ Star this repo if you are interested in the intersection of **Knowledge Management** and **Artificial Intelligence**.
