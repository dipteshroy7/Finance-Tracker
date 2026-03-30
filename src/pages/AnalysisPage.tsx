import SummaryCards from '../components/analysis/SummaryCards'
import CategoryBreakdown from '../components/analysis/CategoryBreakdown'
import AccountBalances from '../components/analysis/AccountBalances'
import MonthlyTrends from '../components/analysis/MonthlyTrends'

export default function AnalysisPage() {
  return (
    <div className="space-y-6 py-5">
      <SummaryCards />
      <MonthlyTrends />
      <CategoryBreakdown />
      <AccountBalances />
    </div>
  )
}
