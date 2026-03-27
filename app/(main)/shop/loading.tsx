const Loading = () => {
  return (
    <div className="flex w-full flex-col gap-4 p-4">
      {/* Title bar */}
      <div className="h-8 w-32 animate-pulse rounded-xl bg-muted" />

      {/* Image placeholder */}
      <div className="h-32 w-full animate-pulse rounded-xl bg-muted" />

      {/* Item cards */}
      <div className="h-20 w-full animate-pulse rounded-xl bg-muted" />
      <div className="h-20 w-full animate-pulse rounded-xl bg-muted" />
    </div>
  );
};

export default Loading;
