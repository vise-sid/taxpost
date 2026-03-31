type ComparisonCardProps = {
  title: string;
  oldLabel: string;
  oldText: string;
  newLabel: string;
  newText: string;
};

export const ComparisonCard = ({
  title,
  oldLabel,
  oldText,
  newLabel,
  newText,
}: ComparisonCardProps) => {
  return (
    <div className="overflow-hidden rounded-xl border-2">
      <div className="bg-neutral-100 px-4 py-2">
        <p className="text-xs font-bold uppercase tracking-wide text-neutral-500">{title}</p>
      </div>
      <div className="grid grid-cols-2 divide-x">
        <div className="bg-red-50/50 p-4">
          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-red-400">{oldLabel}</p>
          <p className="text-sm text-red-700">{oldText}</p>
        </div>
        <div className="bg-green-50/50 p-4">
          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-green-500">{newLabel}</p>
          <p className="text-sm text-green-700">{newText}</p>
        </div>
      </div>
    </div>
  );
};
