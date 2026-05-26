export function SkeletonCard({ className = '' }) {
  return (
    <div className={`glass-card p-5 ${className}`}>
      <div className="skeleton h-4 w-1/3 mb-3" />
      <div className="skeleton h-8 w-2/3 mb-4" />
      <div className="skeleton h-3 w-full mb-2" />
      <div className="skeleton h-3 w-4/5 mb-2" />
      <div className="skeleton h-3 w-3/5" />
    </div>
  )
}

export function SkeletonList({ count = 3, className = '' }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-card p-4 flex items-center gap-4">
          <div className="skeleton w-10 h-10 rounded-lg flex-shrink-0" />
          <div className="flex-1">
            <div className="skeleton h-4 w-1/3 mb-2" />
            <div className="skeleton h-3 w-2/3" />
          </div>
          <div className="skeleton h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonStats({ count = 4 }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-card p-5">
          <div className="skeleton h-3 w-20 mb-3" />
          <div className="skeleton h-8 w-16 mb-2" />
          <div className="skeleton h-2 w-full rounded-full" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton h-4"
          style={{ width: `${Math.floor(Math.random() * 40) + 60}%` }}
        />
      ))}
    </div>
  )
}

// Generic skeleton block
export default function Skeleton({ className = '', style = {} }) {
  return <div className={`skeleton ${className}`} style={style} />
}
