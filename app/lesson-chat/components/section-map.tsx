type SectionMapProps = {
  title: string;
  mappings: {
    oldSection: string;
    newSection: string;
    subject: string;
    changeType?: string;
  }[];
};

export const SectionMap = ({ title, mappings }: SectionMapProps) => {
  return (
    <div className="overflow-hidden rounded-xl border-2">
      <div className="bg-neutral-100 px-4 py-2">
        <p className="text-xs font-bold uppercase tracking-wide text-neutral-500">{title}</p>
      </div>
      <div className="divide-y">
        {mappings.map((m, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-2.5 text-sm">
            <div className="w-16 shrink-0">
              <span className="font-mono text-xs text-red-500">{m.oldSection}</span>
            </div>
            <span className="text-neutral-300">→</span>
            <div className="w-16 shrink-0">
              <span className="font-mono text-xs font-bold text-green-600">{m.newSection}</span>
            </div>
            <div className="flex-1 text-xs text-neutral-600">{m.subject}</div>
            {m.changeType && (
              <span className="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-500">
                {m.changeType}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
