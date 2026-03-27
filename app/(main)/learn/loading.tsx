const Loading = () => {
  return (
    <div className="flex w-full flex-col items-center gap-6 p-4">
      {/* Banner */}
      <div className="h-24 w-full animate-pulse rounded-xl bg-muted" />

      {/* Zigzag lesson buttons */}
      <div className="flex w-full flex-col items-center gap-8 pt-4">
        <div className="h-16 w-16 animate-pulse rounded-full bg-muted" />
        <div className="ml-20 h-16 w-16 animate-pulse rounded-full bg-muted" />
        <div className="-ml-10 h-16 w-16 animate-pulse rounded-full bg-muted" />
        <div className="ml-16 h-16 w-16 animate-pulse rounded-full bg-muted" />
      </div>
    </div>
  );
};

export default Loading;
