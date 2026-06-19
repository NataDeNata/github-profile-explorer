const Pulse = ({ className }) => (
  <div className={`bg-gray-200 dark:bg-gray-700 rounded animate-pulse ${className}`} />
)

export default function ProfileCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm flex gap-6 items-start">
      {/* Avatar */}
      <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0" />

      <div className="flex-1 min-w-0 space-y-3">
        {/* Name */}
        <Pulse className="h-7 w-48" />
        {/* @login */}
        <Pulse className="h-4 w-32" />
        {/* Bio — two lines */}
        <div className="space-y-1.5 pt-1">
          <Pulse className="h-3.5 w-full" />
          <Pulse className="h-3.5 w-4/5" />
        </div>
        {/* Stats row */}
        <div className="flex flex-wrap gap-4 pt-1">
          <Pulse className="h-4 w-24" />
          <Pulse className="h-4 w-24" />
          <Pulse className="h-4 w-16" />
        </div>
      </div>
    </div>
  )
}
