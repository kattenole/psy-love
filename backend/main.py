import os
import asyncio
from datetime import datetime, timezone
from typing import List, Optional, Dict
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from dotenv import load_dotenv
import json

from graphiti_core import Graphiti
from graphiti_core.llm_client.gemini_client import GeminiClient, LLMConfig
from graphiti_core.embedder.gemini import GeminiEmbedder, GeminiEmbedderConfig
from graphiti_core.nodes import EpisodeType

# Load environment variables
load_dotenv()

# In-memory storage for conversations (fallback when Graphiti has issues)
conversations_storage: Dict[str, List[Dict]] = {}

app = FastAPI(title="AI Psychologist Backend", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://work-1-uxxwrxivjamwipsw.prod-runtime.all-hands.dev"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Graphiti client
graphiti_client: Optional[Graphiti] = None



# Pydantic models
class ConversationMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str
    timestamp: Optional[datetime] = None

class ConversationRequest(BaseModel):
    user_id: str
    message: str
    session_id: Optional[str] = None

class ConversationResponse(BaseModel):
    response: str
    session_id: str
    emotion_analysis: Optional[dict] = None

class JournalEntry(BaseModel):
    user_id: str
    content: str
    date: Optional[str] = None
    emotions: Optional[List[str]] = None

class UserProfile(BaseModel):
    user_id: str
    name: Optional[str] = None
    preferences: Optional[dict] = None

class ChatMessage(BaseModel):
    id: str
    role: str  # "user" or "assistant"
    content: str
    timestamp: str
    user_id: str
    session_id: str = "default"

class ConversationHistory(BaseModel):
    user_id: str
    session_id: str = "default"

async def initialize_graphiti():
    """Initialize Graphiti client with Gemini embedder"""
    global graphiti_client
    
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        print("⚠️  GOOGLE_API_KEY not set, running in demo mode without Graphiti")
        graphiti_client = None
        return
    
    neo4j_uri = os.getenv("NEO4J_URI", "bolt://localhost:7687")
    neo4j_user = os.getenv("NEO4J_USER", "neo4j")
    neo4j_password = os.getenv("NEO4J_PASSWORD", "password")
    
    try:
        # Test Neo4j connection first
        from neo4j import GraphDatabase
        driver = GraphDatabase.driver(neo4j_uri, auth=(neo4j_user, neo4j_password))
        with driver.session() as session:
            session.run("RETURN 1")
        driver.close()
        
        graphiti_client = Graphiti(
            neo4j_uri,
            neo4j_user,
            neo4j_password,
            llm_client=GeminiClient(
                config=LLMConfig(
                    api_key=api_key,
                    model="gemini-2.0-flash"
                )
            ),
            embedder=GeminiEmbedder(
                config=GeminiEmbedderConfig(
                    api_key=api_key,
                    embedding_model="text-embedding-004"
                )
            )
        )
        
        # Build indices and constraints
        await graphiti_client.build_indices_and_constraints()
        print("✅ Graphiti client initialized successfully with Neo4j")
        
    except Exception as e:
        print(f"⚠️  Failed to initialize Graphiti: {e}")
        if "Connect call failed" in str(e) or "Cannot assign requested address" in str(e):
            print("   Neo4j is not running. Please start Neo4j to enable full functionality.")
            print("   Run: docker-compose up -d neo4j")
        print("   Running in demo mode without Graphiti")
        graphiti_client = None

async def generate_ai_response(message: str, context: str = "", user_id: str = "anonymous") -> str:
    """Generate AI response using Gemini"""
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        return "Beklager, AI-tjenesten er ikke tilgængelig lige nu. Prøv igen senere."
    
    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.0-flash')
        
        # Create a comprehensive prompt for the AI psychologist
        system_prompt = """Du er en erfaren og empatisk dansk psykolog, der specialiserer sig i kognitiv adfærdsterapi (CBT) og mindfulness-baserede tilgange. 

Dine principper:
- Vær altid empatisk, ikke-dømmende og støttende
- Stil åbne spørgsmål for at hjælpe brugeren med at udforske deres følelser
- Brug evidensbaserede terapeutiske teknikker
- Responder på dansk med en varm og professionel tone
- Fokuser på brugerens styrker og resiliens
- Tilbyd praktiske øvelser og strategier når det er relevant

Hvis brugeren nævner selvskade eller selvmordstanker, skal du:
1. Anerkende deres mod til at dele
2. Opfordre dem til at søge professionel hjælp
3. Foreslå kriselinjer: Livslinjen (70 201 201) eller Børnetelefonen (116 111)

Svar kort og fokuseret (max 2-3 sætninger), medmindre brugeren beder om mere detaljeret hjælp."""

        # Prepare the prompt with context
        prompt = f"{system_prompt}\n\n"
        if context:
            prompt += f"Tidligere samtalekontext:\n{context}\n\n"
        prompt += f"Bruger: {message}\n\nPsykolog:"
        
        response = model.generate_content(prompt)
        return response.text.strip()
        
    except Exception as e:
        print(f"Error generating AI response: {e}")
        return "Jeg har tekniske problemer lige nu. Kan du prøve at omformulere dit spørgsmål?"

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    await initialize_graphiti()

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc)}

@app.post("/api/conversation", response_model=ConversationResponse)
async def handle_conversation(request: ConversationRequest):
    """Handle conversation with AI psychologist"""
    
    try:
        context = ""
        
        # If Graphiti is available, search for relevant context
        if graphiti_client:
            try:
                edge_results = await graphiti_client.search(
                    request.message,
                    center_node_uuid=None,  # We'll implement user-specific search later
                    num_results=5
                )
                
                # Format context for the AI
                if edge_results:
                    facts = [edge.fact for edge in edge_results]
                    context = "Previous context:\n" + "\n".join(facts)
            except Exception as e:
                print(f"Warning: Graphiti search failed: {e}")
        
        # Generate AI response with context
        response_content = await generate_ai_response(request.message, context, request.user_id)
        
        # Store conversation in simple format for easy retrieval
        if request.user_id not in conversations_storage:
            conversations_storage[request.user_id] = []
        
        conversation_data = {
            "user_message": request.message,
            "ai_response": response_content,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "session_id": request.session_id or "default"
        }
        conversations_storage[request.user_id].append(conversation_data)
        
        # Also try to store in Graphiti
        if graphiti_client:
            try:
                episode_body = f"User: {request.message}\nPsychologist: {response_content}"
                await graphiti_client.add_episode(
                    name=f"Conversation with {request.user_id}",
                    episode_body=episode_body,
                    source=EpisodeType.message,
                    reference_time=datetime.now(timezone.utc),
                    source_description="AI Psychologist Conversation"
                )
            except Exception as e:
                print(f"Warning: Failed to store conversation in Graphiti: {e}")
        
        return ConversationResponse(
            response=response_content,
            session_id=request.session_id or "default",
            emotion_analysis={"detected_emotions": ["neutral"], "confidence": 0.8}
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Conversation error: {str(e)}")

@app.get("/api/user/{user_id}/conversations")
async def get_user_conversations(user_id: str, session_id: str = "default"):
    """Get conversation history for a user"""
    
    # First try to get from in-memory storage
    if user_id in conversations_storage:
        conversations = conversations_storage[user_id]
        # Filter by session_id if specified
        if session_id != "default":
            conversations = [conv for conv in conversations if conv.get("session_id") == session_id]
        return {"conversations": conversations}
    
    # Fallback to Graphiti if available
    if graphiti_client:
        try:
            # Search for conversations related to this user
            edge_results = await graphiti_client.search(
                f"Conversation with {user_id}",
                num_results=50
            )
            
            messages = []
            if edge_results:
                for edge in edge_results:
                    # Parse the conversation from the fact
                    fact = edge.fact
                    if "User:" in fact and "Psychologist:" in fact:
                        lines = fact.split("\n")
                        user_msg = ""
                        ai_msg = ""
                        
                        for line in lines:
                            if line.startswith("User:"):
                                user_msg = line[5:].strip()
                            elif line.startswith("Psychologist:"):
                                ai_msg = line[13:].strip()
                        
                        if user_msg and ai_msg:
                            timestamp = edge.created_at.isoformat() if hasattr(edge, 'created_at') and edge.created_at else datetime.now(timezone.utc).isoformat()
                            
                            # Add user message
                            messages.append({
                                "id": f"user_{len(messages)}",
                                "role": "user",
                                "content": user_msg,
                                "timestamp": timestamp,
                                "user_id": user_id,
                                "session_id": session_id
                            })
                            
                            # Add assistant message
                            messages.append({
                                "id": f"assistant_{len(messages)}",
                                "role": "assistant",
                                "content": ai_msg,
                                "timestamp": timestamp,
                                "user_id": user_id,
                                "session_id": session_id
                            })
            
            # Sort by timestamp
            messages.sort(key=lambda x: x["timestamp"])
            
            return {"messages": messages}
            
        except Exception as e:
            print(f"Error retrieving conversations from Graphiti: {e}")
    
    # Return empty if no storage available
    return {"messages": []}

@app.post("/api/journal")
async def create_journal_entry(entry: JournalEntry):
    """Create a new journal entry"""
    
    try:
        # Store journal entry in Graphiti if available
        if graphiti_client:
            try:
                await graphiti_client.add_episode(
                    name=f"Journal Entry - {entry.user_id}",
                    episode_body=entry.content,
                    source=EpisodeType.text,
                    reference_time=datetime.now(timezone.utc),
                    source_description="Daily Journal Entry"
                )
            except Exception as e:
                print(f"Warning: Failed to store journal entry in Graphiti: {e}")
        
        return {"status": "success", "message": "Journal entry created successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Journal creation error: {str(e)}")

@app.get("/api/user/{user_id}/insights")
async def get_user_insights(user_id: str):
    """Get psychological insights for a user"""
    if not graphiti_client:
        raise HTTPException(status_code=500, detail="Graphiti client not initialized")
    
    try:
        # Search for user-related information
        edge_results = await graphiti_client.search(
            f"user {user_id} emotions patterns behavior",
            num_results=10
        )
        
        insights = {
            "emotional_patterns": [],
            "conversation_themes": [],
            "progress_indicators": [],
            "recommendations": []
        }
        
        if edge_results:
            # Analyze the facts to generate insights
            facts = [edge.fact for edge in edge_results]
            insights["conversation_themes"] = facts[:5]  # Simplified for now
        
        return insights
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Insights error: {str(e)}")

@app.post("/api/user/profile")
async def update_user_profile(profile: UserProfile):
    """Update user profile information"""
    if not graphiti_client:
        raise HTTPException(status_code=500, detail="Graphiti client not initialized")
    
    try:
        # Store user profile in Graphiti
        profile_data = f"User {profile.user_id} profile: name={profile.name}, preferences={profile.preferences}"
        await graphiti_client.add_episode(
            name=f"User Profile - {profile.user_id}",
            episode_body=profile_data,
            source=EpisodeType.text,
            reference_time=datetime.now(timezone.utc),
            source_description="User Profile Information"
        )
        
        return {"status": "success", "message": "Profile updated successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Profile update error: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", 8000)),
        reload=True
    )