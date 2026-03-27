const Loading = () => {
  return (
    <div className="flex w-full flex-col gap-4 p-4">
      {/* Tab bar */}
      <div className="flex gap-0 overflow-hidden rounded-xl border-2">
        <div className="h-12 flex-1 animate-pulse bg-muted" />
        <div className="h-12 flex-1 animate-pulse bg-muted" />
      </div>

      {/* Leaderboard rows */}
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-xl p-2 px-4">
          <div className="h-12 w-12 animate-pulse rounded-full bg-muted" />
          <div className="h-4 w-32 animate-pulse rounded-xl bg-muted" />
          <div className="flex-1" />
          <div className="h-4 w-16 animate-pulse rounded-xl bg-muted" />
        </div>
      ))}
    </div>
  );
};

export default Loading;
