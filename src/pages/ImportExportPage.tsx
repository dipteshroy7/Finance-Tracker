import CsvImport from '../components/import-export/CsvImport'
import CsvExport from '../components/import-export/CsvExport'

export default function ImportExportPage() {
  return (
    <div className="p-4 pt-5 space-y-8">
      <CsvImport />
      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <CsvExport />
    </div>
  )
}
