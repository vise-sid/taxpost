const Loading = () => {
  return (
    <div className="flex w-full flex-col gap-4 p-4">
      {/* Title bar */}
      <div className="h-8 w-40 animate-pulse rounded-xl bg-muted" />

      {/* Image placeholder */}
      <div className="h-32 w-full animate-pulse rounded-xl bg-muted" />

      {/* Quest rows */}
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex flex-col gap-2 rounded-xl p-3">
          <div className="h-4 w-48 animate-pulse rounded-xl bg-muted" />
          <div className="h-3 w-full animate-pulse rounded-xl bg-muted" />
        </div>
      ))}
    </div>
  );
};

export default Loading;
