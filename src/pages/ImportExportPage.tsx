import CsvImport from '../components/import-export/CsvImport'
import CsvExport from '../components/import-export/CsvExport'

export default function ImportExportPage() {
  return (
    <div className="space-y-8">
      <CsvImport />
      <div className="h-px bg-border" />
      <CsvExport />
    </div>
  )
}
