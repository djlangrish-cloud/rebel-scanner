import EqualizerViz from './EqualizerViz'
import ScanForm from './ScanForm'

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <EqualizerViz score={75} maxScore={100} size="lg" />
      <h1
        className="text-white font-bold text-4xl uppercase mt-8 leading-tight"
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        Find out how AI reads your website
      </h1>
      <p className="text-white/70 text-base mt-3 max-w-md leading-relaxed">
        Scored on Findability, Quotability, Understandability, and Trustworthiness.
        Free. No account needed.
      </p>
      <div className="w-full max-w-xl mt-8">
        <ScanForm hero />
      </div>
    </div>
  )
}
