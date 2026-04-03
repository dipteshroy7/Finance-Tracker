import SummaryCards from '../components/analysis/SummaryCards'
import CategoryBreakdown from '../components/analysis/CategoryBreakdown'
import MonthlyTrends from '../components/analysis/MonthlyTrends'

export default function AnalysisPage() {
  return (
    <div className="flex flex-col gap-6">
      <SummaryCards />
      <MonthlyTrends />
      <CategoryBreakdown />
    </div>
  )
}
