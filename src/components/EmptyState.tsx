import EqualizerViz from './EqualizerViz'

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <EqualizerViz score={75} maxScore={100} size="lg" />
      <h2
        className="text-white font-bold text-4xl uppercase mt-8 leading-tight"
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        PASTE A URL TO BEGIN
      </h2>
      <p className="text-white/40 text-base mt-3 max-w-md leading-relaxed">
        Analyse any website for AI search visibility. Get scored on Findability, Quotability,
        Understandability, and Trustworthiness.
      </p>
    </div>
  )
}
