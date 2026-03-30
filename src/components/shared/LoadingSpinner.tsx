export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-10 h-10 rounded-full border-3 border-primary/20 border-t-primary animate-spin" />
    </div>
  )
}
