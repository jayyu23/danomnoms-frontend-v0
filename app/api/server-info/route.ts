import { NextResponse } from "next/server"

// Store server start time (this will be regenerated on each server restart)
const SERVER_START_TIME = Date.now()

export async function GET() {
  return NextResponse.json({
    serverStartTime: SERVER_START_TIME,
    timestamp: new Date().toISOString(),
  })
}
