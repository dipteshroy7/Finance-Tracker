import SummaryCards from '../components/analysis/SummaryCards'
import CategoryBreakdown from '../components/analysis/CategoryBreakdown'
import MonthlyTrends from '../components/analysis/MonthlyTrends'

export default function AnalysisPage() {
  return (
    <div className="flex flex-col gap-6 py-5 px-4 md:px-0">
      <SummaryCards />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MonthlyTrends />
        <CategoryBreakdown />
      </div>
    </div>
  )
}
