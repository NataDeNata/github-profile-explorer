const Pulse = ({ className }) => (
  <div className={`bg-gray-200 dark:bg-gray-700 rounded animate-pulse ${className}`} />
)

function RepoCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm flex flex-col gap-3">
      {/* Repo name */}
      <Pulse className="h-4 w-3/5" />
      {/* Description lines */}
      <div className="space-y-1.5">
        <Pulse className="h-3 w-full" />
        <Pulse className="h-3 w-4/5" />
      </div>
      {/* Language · stars · forks */}
      <div className="flex gap-3 mt-auto pt-2">
        <Pulse className="h-3 w-16" />
        <Pulse className="h-3 w-12" />
        <Pulse className="h-3 w-12" />
      </div>
    </div>
  )
}

export default function RepoGridSkeleton() {
  return (
    <div>
      <Pulse className="h-6 w-40 mb-4" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <RepoCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
