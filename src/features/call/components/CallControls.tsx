type CallControlsProps = {
  onEndCall: () => void
  isEnding: boolean
}

export default function CallControls({
  onEndCall,
  isEnding,
}: CallControlsProps) {
  return (
    <button
      onClick={onEndCall}
      disabled={isEnding}
      className="bg-[#ff914d] text-white px-6 py-3 rounded-full font-bold shadow-lg disabled:opacity-60"
    >
      {isEnding ? '終了中...' : '通話を終了する'}
    </button>
  )
}
