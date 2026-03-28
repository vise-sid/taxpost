type UnitBannerProps = {
  title: string;
  description: string;
};

export const UnitBanner = ({ title, description }: UnitBannerProps) => {
  return (
    <div className="flex items-center gap-4 py-4">
      <div className="h-[2px] flex-1 bg-gray-200" />
      <div className="text-center">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 lg:text-base">
          {title}
        </h3>
        <p className="text-xs text-gray-400">{description}</p>
      </div>
      <div className="h-[2px] flex-1 bg-gray-200" />
    </div>
  );
};
