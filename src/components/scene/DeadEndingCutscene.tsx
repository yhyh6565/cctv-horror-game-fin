export default function DeadEndingCutscene() {
  return (
    <div className="absolute inset-0 z-50 bg-black flex items-center justify-center">
      <p className="text-red-600 font-mono text-xl animate-pulse text-center">
        거짓 대답을 한 경우 :<br />따로 번호 안내는 없다.<br />명복을 빈다.
      </p>
    </div>
  )
}
