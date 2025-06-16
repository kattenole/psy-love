# 🧠 AI Psykolog Team

An AI-powered psychological support platform that provides personalized mental health assistance through intelligent conversations, adaptive therapy tools, and comprehensive emotional tracking.

## Features

- **Adaptive Conversation Flow** - LangGraph orchestrates psychological conversations based on user state
- **Contextual Memory** - Graphiti Knowledge Graph remembers previous sessions, patterns, and progress
- **Emotional Journey Tracking** - Neo4j stores emotional journey over time with connections between triggers and reactions
- **Multimodal Understanding** - Analyzes uploaded images alongside text for deeper insights
- **AI-Powered Journaling** - `/dagbog` command creates new journal entries with emotion analysis
- **Personal Analytics** - Visual insights into emotional patterns and progress

## Tech Stack

- **Frontend**: Next.js 14+ with App Router, Tailwind CSS
- **AI Orchestration**: LangGraph for conversation flows
- **Knowledge Management**: Graphiti Knowledge Graph with GeminiEmbedder "Text Embedding 001"
- **Graph Database**: Neo4j for relationship mapping
- **Authentication**: NextAuth.js with Google provider
- **Backend**: FastAPI with Python

## Prerequisites

- Node.js 18+ and npm
- Python 3.10+
- Docker and Docker Compose
- Google API key for Gemini
- Google OAuth credentials

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd psy-love

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install graphiti-core[google-genai] fastapi uvicorn python-dotenv neo4j
```

### 2. Start Neo4j Database

```bash
# Start Neo4j with Docker Compose
docker-compose up -d neo4j

# Wait for Neo4j to be ready (check http://localhost:7474)
# Default credentials: neo4j/password
```

### 3. Configure Environment Variables

Update the environment files with your API keys:

**Frontend (.env.local):**
```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-here
GOOGLE_API_KEY=your-google-api-key-here
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password
BACKEND_API_URL=http://localhost:8000
```

**Backend (backend/.env):**
```
GOOGLE_API_KEY=your-google-api-key-here
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password
HOST=0.0.0.0
PORT=8000
```

### 4. Start the Applications

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
python main.py
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### 5. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Neo4j Browser: http://localhost:7474

## Key Features

### Conversation System
- AI-powered conversations with contextual memory
- Type `/dagbog` to create journal entries
- Emotion detection and adaptive responses

### Journal System
- Daily journaling with mood tracking
- AI-generated insights and patterns
- Emotion analysis and visualization

### Analytics Dashboard
- Personal insights and progress tracking
- Emotion distribution charts
- Achievement system

## Development

Start the development servers:

```bash
# Terminal 1 - Start Neo4j
docker-compose up -d

# Terminal 2 - Start backend
cd backend && source venv/bin/activate && python main.py

# Terminal 3 - Start frontend
npm run dev
```

## Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

For the backend, consider using Railway, Render, or AWS with a managed Neo4j instance.

---

**Made with ❤️ by Better Human AI**  
*Share your journey with #BetterHumanAI*
