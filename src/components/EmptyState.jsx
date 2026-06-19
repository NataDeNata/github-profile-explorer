export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center select-none">
      <Icon className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" aria-hidden="true" />
      <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-xs">{description}</p>
      )}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-4 text-sm text-indigo-500 hover:underline"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
