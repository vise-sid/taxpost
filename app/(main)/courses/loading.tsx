const Loading = () => {
  return (
    <div className="flex w-full flex-col gap-4 p-4">
      {/* Title bar */}
      <div className="h-8 w-48 animate-pulse rounded-xl bg-muted" />

      {/* 2x3 card grid */}
      <div className="grid grid-cols-2 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-44 animate-pulse rounded-xl bg-muted"
          />
        ))}
      </div>
    </div>
  );
};

export default Loading;
