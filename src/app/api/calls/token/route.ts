import { NextRequest, NextResponse } from 'next/server'
import { generateAgoraToken } from '@/lib/agora'

export async function POST(req: NextRequest) {
  const { channelName, uid } = await req.json()

  if (!channelName || uid === undefined) {
    return NextResponse.json(
      { error: 'channelNameとuidが必要です' },
      { status: 400 },
    )
  }

  const token = generateAgoraToken(channelName, uid)

  return NextResponse.json({ token })
}
