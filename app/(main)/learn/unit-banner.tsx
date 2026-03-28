type UnitBannerProps = {
  title: string;
  description: string;
  isFirst?: boolean;
};

export const UnitBanner = ({ title, description, isFirst }: UnitBannerProps) => {
  if (isFirst) return null;

  return (
    <div className="flex items-center gap-4 pb-2 pt-6">
      <div className="h-[2px] flex-1 bg-gray-200" />
      <div className="shrink-0 text-center">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">
          {title}
        </h3>
      </div>
      <div className="h-[2px] flex-1 bg-gray-200" />
    </div>
  );
};
