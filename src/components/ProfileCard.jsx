export default function ProfileCard({ user, repoCount }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm flex gap-6 items-start">
      <img
        src={user.avatar_url}
        alt={user.name || user.login}
        loading="lazy"
        className="w-24 h-24 rounded-full flex-shrink-0"
      />

      <div className="flex-1 min-w-0">
        <h2 className="text-2xl font-bold">{user.name || user.login}</h2>
        <a
          href={user.html_url}
          target="_blank"
          rel="noreferrer"
          className="text-indigo-500 hover:underline text-sm"
        >
          @{user.login}
        </a>

        {user.bio && (
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">{user.bio}</p>
        )}

        <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600 dark:text-gray-400">
          <span>
            <strong className="text-gray-900 dark:text-gray-100">
              {user.followers.toLocaleString()}
            </strong>{' '}
            followers
          </span>
          <span>
            <strong className="text-gray-900 dark:text-gray-100">
              {user.following.toLocaleString()}
            </strong>{' '}
            following
          </span>
          <span>
            <strong className="text-gray-900 dark:text-gray-100">{repoCount}</strong> repos
          </span>
          {user.location && <span>Location: {user.location}</span>}
          {user.company && <span>Company: {user.company}</span>}
          {user.blog && (
            <a
              href={user.blog.startsWith('http') ? user.blog : `https://${user.blog}`}
              target="_blank"
              rel="noreferrer"
              className="text-indigo-500 hover:underline"
            >
              {user.blog}
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
