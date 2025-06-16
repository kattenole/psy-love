import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("session_id") || "default"

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Forward request to Python backend
    const backendUrl = process.env.BACKEND_API_URL || "http://localhost:8000"
    const response = await fetch(`${backendUrl}/api/user/${userId}/conversations?session_id=${sessionId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error("Error fetching user conversations:", error)
    return NextResponse.json(
      { error: "Failed to fetch user conversations" },
      { status: 500 }
    )
  }
}