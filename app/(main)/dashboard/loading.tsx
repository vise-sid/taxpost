const Loading = () => {
  return (
    <div className="flex w-full flex-col gap-4 p-4">
      {/* 2x2 stat cards */}
      <div className="grid grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-xl bg-muted"
          />
        ))}
      </div>

      {/* Progress bar rows */}
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex flex-col gap-2 rounded-xl p-3">
          <div className="h-4 w-40 animate-pulse rounded-xl bg-muted" />
          <div className="h-3 w-full animate-pulse rounded-xl bg-muted" />
        </div>
      ))}
    </div>
  );
};

export default Loading;
