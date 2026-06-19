const PROFILES = [
  { username: 'torvalds',    name: 'Linus Torvalds',  role: 'Creator of Linux & Git' },
  { username: 'gaearon',     name: 'Dan Abramov',     role: 'Co-creator of Redux · React core' },
  { username: 'yyx990803',   name: 'Evan You',        role: 'Creator of Vue.js & Vite' },
  { username: 'sindresorhus',name: 'Sindre Sorhus',   role: '1000+ open-source packages' },
  { username: 'addyosmani',  name: 'Addy Osmani',     role: 'Engineering Manager at Google' },
  { username: 'tj',          name: 'TJ Holowaychuk',  role: 'Creator of Express & Koa' },
]

function ProfileChip({ profile, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(profile.username)}
      className="group flex items-center gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md transition-all text-left w-full"
    >
      <img
        src={`https://github.com/${profile.username}.png?size=64`}
        alt={profile.name}
        className="w-10 h-10 rounded-full ring-2 ring-gray-100 dark:ring-gray-700 group-hover:ring-indigo-200 dark:group-hover:ring-indigo-700 transition-all shrink-0"
      />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{profile.name}</p>
        <p className="text-xs text-gray-400 truncate">{profile.role}</p>
        <p className="text-xs text-indigo-500 dark:text-indigo-400 font-mono truncate">@{profile.username}</p>
      </div>
    </button>
  )
}

export default function FeaturedProfiles({ onSelect }) {
  return (
    <div className="mt-10">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
        Or explore a popular profile →
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {PROFILES.map(p => (
          <ProfileChip key={p.username} profile={p} onSelect={onSelect} />
        ))}
      </div>
    </div>
  )
}
