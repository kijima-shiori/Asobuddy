import { RtcTokenBuilder, RtcRole } from 'agora-token'

const APP_ID = process.env.AGORA_APP_ID!
const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE!

// チャンネル名とユーザーIDを受け取り、トークンを返す関数
export function generateAgoraToken(channelName: string, uid: number): string {
  // トークンの有効期限（15分+余裕を持って5分の計20分）を設定
  const expirationTimeInSeconds = 1200
  // 現在時刻を秒単位で取得
  const currentTimestamp = Math.floor(Date.now() / 1000)
  // 現在時刻 + 1200秒 = トークンが切れる時刻
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds

  const token = RtcTokenBuilder.buildTokenWithUid(
    APP_ID,
    APP_CERTIFICATE,
    channelName,
    uid,
    RtcRole.PUBLISHER,
    privilegeExpiredTs,
    privilegeExpiredTs,
  )

  return token
}
