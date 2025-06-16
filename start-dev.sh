#!/bin/bash

echo "🧠 AI Psykolog Team - Development Setup"
echo "======================================"

# Check if Neo4j is needed
echo "Note: Neo4j database is required for full functionality."
echo "Please ensure Neo4j is running on bolt://localhost:7687"
echo "Default credentials: neo4j/password"
echo ""

# Start backend in background
echo "Starting backend server..."
cd backend
source venv/bin/activate
python main.py &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "Starting frontend server..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "🚀 Servers started!"
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for user to stop
wait $FRONTEND_PID $BACKEND_PID