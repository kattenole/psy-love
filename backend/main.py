import os
import asyncio
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from dotenv import load_dotenv

from graphiti_core import Graphiti
from graphiti_core.llm_client.gemini_client import GeminiClient, LLMConfig
from graphiti_core.embedder.gemini import GeminiEmbedder, GeminiEmbedderConfig
from graphiti_core.nodes import EpisodeType

# Load environment variables
load_dotenv()

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
                    embedding_model="text-embedding-001"
                )
            )
        )
        
        # Build indices and constraints
        await graphiti_client.build_indices_and_constraints()
        print("✅ Graphiti client initialized successfully")
        
    except Exception as e:
        print(f"⚠️  Failed to initialize Graphiti: {e}")
        print("   Running in demo mode without Graphiti")
        graphiti_client = None

def generate_demo_response(message: str) -> str:
    """Generate a demo response for when Graphiti is not available"""
    message_lower = message.lower()
    
    if "/dagbog" in message_lower:
        return "Jeg har oprettet en ny dagbogsindgang for dig. Gå til Dagbog-fanen for at begynde at skrive. Hvad vil du gerne udforske i din dagbog i dag?"
    
    if any(word in message_lower for word in ["trist", "ked", "deprimeret", "dårlig"]):
        return "Jeg kan høre, at du går gennem en svær tid. Det er modigt af dig at dele det med mig. Kan du fortælle mig mere om, hvad der får dig til at føle dig sådan?"
    
    if any(word in message_lower for word in ["glad", "lykkelig", "godt", "fantastisk"]):
        return "Det er dejligt at høre, at du har det godt! Positive følelser er vigtige at anerkende. Hvad tror du, der bidrager til denne gode følelse?"
    
    if any(word in message_lower for word in ["stress", "stresset", "presset", "overvældet"]):
        return "Stress kan være meget udmattende. Lad os udforske, hvad der forårsager denne stress. Kan du identificere de specifikke faktorer, der bidrager til denne følelse?"
    
    if any(word in message_lower for word in ["angst", "bekymret", "nervøs", "urolig"]):
        return "Angst kan være meget udfordrende at håndtere. Du er ikke alene med disse følelser. Hvad er det, der bekymrer dig mest lige nu?"
    
    # Default empathetic response
    return "Tak for at dele det med mig. Jeg er her for at lytte og støtte dig. Kan du fortælle mig mere om, hvordan du har det med denne situation?"

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
        
        # Generate response based on message content
        response_content = generate_demo_response(request.message)
        
        # Store the conversation in Graphiti if available
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