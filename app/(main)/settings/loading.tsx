const Loading = () => {
  return (
    <div className="flex w-full flex-col gap-6 p-4">
      {/* Title */}
      <div className="h-8 w-36 animate-pulse rounded-xl bg-muted" />

      {/* Input field */}
      <div className="h-12 w-full animate-pulse rounded-xl bg-muted" />

      {/* Toggle row */}
      <div className="flex items-center justify-between">
        <div className="h-4 w-32 animate-pulse rounded-xl bg-muted" />
        <div className="h-8 w-14 animate-pulse rounded-full bg-muted" />
      </div>

      {/* Another input */}
      <div className="h-12 w-full animate-pulse rounded-xl bg-muted" />

      {/* Button */}
      <div className="h-12 w-full animate-pulse rounded-xl bg-muted" />
    </div>
  );
};

export default Loading;
