type UnitBannerProps = {
  title: string;
  description: string;
  isFirst?: boolean;
};

export const UnitBanner = ({ title, description, isFirst }: UnitBannerProps) => {
  if (isFirst) return null;

  return (
    <div className="my-8">
      <div className="flex items-center gap-4">
        <div className="h-[2px] flex-1 bg-gray-200" />
        <span className="shrink-0 text-sm font-bold text-gray-400 italic">
          {title}
        </span>
        <div className="h-[2px] flex-1 bg-gray-200" />
      </div>
    </div>
  );
};
