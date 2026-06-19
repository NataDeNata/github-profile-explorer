import { useMemo } from 'react'

const LEVELS = [
  'bg-gray-100 dark:bg-gray-700',
  'bg-indigo-200 dark:bg-indigo-900',
  'bg-indigo-400 dark:bg-indigo-700',
  'bg-indigo-600 dark:bg-indigo-500',
  'bg-indigo-800 dark:bg-indigo-300',
]

function level(count) {
  if (!count) return 0
  if (count <= 1) return 1
  if (count <= 3) return 2
  if (count <= 6) return 3
  return 4
}

export default function CommitHeatmap({ commitsByDay, loading }) {
  const { cols, monthMarkers } = useMemo(() => {
    const today = new Date()
    today.setHours(23, 59, 59, 999)

    const start = new Date(today)
    start.setDate(today.getDate() - 90)
    start.setDate(start.getDate() - start.getDay()) // rewind to nearest Sunday

    const cols = []
    const monthMarkers = []
    const cur = new Date(start)

    while (cur <= today) {
      const col = []
      for (let d = 0; d < 7; d++) {
        col.push({
          dateStr: cur.toISOString().slice(0, 10),
          date: new Date(cur),
          future: cur > today,
        })
        cur.setDate(cur.getDate() + 1)
      }

      const firstReal = col.find(c => !c.future)
      if (firstReal) {
        const m = firstReal.date.getMonth()
        const last = monthMarkers[monthMarkers.length - 1]
        if (!last || last.month !== m) {
          monthMarkers.push({
            month: m,
            colIndex: cols.length,
            label: firstReal.date.toLocaleDateString('en-US', { month: 'short' }),
          })
        }
      }

      cols.push(col)
    }

    return { cols, monthMarkers }
  }, [])

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
        <div className="h-4 w-44 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-5" />
        <div className="h-24 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm overflow-x-auto">
      <h3 className="font-semibold text-sm mb-4">
        Commit Heatmap
        <span className="ml-2 font-normal text-gray-400 text-xs">· last 90 days (UTC)</span>
      </h3>

      <div className="flex gap-2 min-w-max">
        {/* Day-of-week labels */}
        <div className="flex flex-col gap-1 mt-5">
          {['', 'Mon', '', 'Wed', '', 'Fri', ''].map((label, i) => (
            <div key={i} className="h-3 w-6 flex items-center">
              <span className="text-[9px] text-gray-400 leading-none">{label}</span>
            </div>
          ))}
        </div>

        <div>
          {/* Month labels */}
          <div className="flex gap-1 mb-1 h-4">
            {cols.map((_, ci) => {
              const marker = monthMarkers.find(m => m.colIndex === ci)
              return (
                <div key={ci} className="w-3 overflow-visible">
                  {marker && (
                    <span className="text-[9px] text-gray-400 leading-none whitespace-nowrap">
                      {marker.label}
                    </span>
                  )}
                </div>
              )
            })}
          </div>

          {/* Rows: one per day of week */}
          {Array.from({ length: 7 }, (_, di) => (
            <div key={di} className="flex gap-1 mb-1">
              {cols.map((col, ci) => {
                const cell = col[di]
                if (cell.future) return <div key={ci} className="w-3 h-3" />
                const count = commitsByDay[cell.dateStr] || 0
                return (
                  <div
                    key={ci}
                    className={`w-3 h-3 rounded-sm ${LEVELS[level(count)]}`}
                    title={`${cell.dateStr}: ${count} commit${count !== 1 ? 's' : ''}`}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1 mt-3 justify-end">
        <span className="text-[10px] text-gray-400 mr-0.5">Less</span>
        {LEVELS.map((cls, i) => (
          <div key={i} className={`w-3 h-3 rounded-sm ${cls}`} />
        ))}
        <span className="text-[10px] text-gray-400 ml-0.5">More</span>
      </div>
    </div>
  )
}
