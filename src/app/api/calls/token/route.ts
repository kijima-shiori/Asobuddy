import { NextRequest, NextResponse } from 'next/server'
import { generateAgoraToken } from '@/lib/agora'
export async function POST(req: NextRequest) {
  try {
    const { channelName, uid } = await req.json()
    if (!channelName || uid === undefined || uid === null) {
      return NextResponse.json(
        { error: 'channelNameとuidが必要です' },
        { status: 400 },
      )
    }
    const numericUid = Number(uid)
    if (isNaN(numericUid)) {
      return NextResponse.json(
        { error: 'uidは数値である必要があります' },
        { status: 400 },
      )
    }
    const token = generateAgoraToken(channelName, numericUid)
    return NextResponse.json({ token })
  } catch (error) {
    console.error('Token generation error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
