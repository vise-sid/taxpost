"use client";

type ResponseChipsProps = {
  options: string[];
  onSelect: (text: string) => void;
  disabled: boolean;
};

export const ResponseChips = ({ options, onSelect, disabled }: ResponseChipsProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onSelect(option)}
          disabled={disabled}
          className="rounded-full border-2 border-brand-navy/30 px-4 py-2 text-sm font-medium text-brand-navy transition-all hover:border-brand-navy hover:bg-brand-navy/5 active:scale-95 disabled:opacity-40"
        >
          {option}
        </button>
      ))}
    </div>
  );
};
