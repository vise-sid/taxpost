type UnitBannerProps = {
  title: string;
  description: string;
  isFirst?: boolean;
};

export const UnitBanner = ({ title, description, isFirst }: UnitBannerProps) => {
  if (isFirst) return null;

  return (
    <div className="my-6">
      <div className="flex items-center gap-4">
        <div className="h-[2px] flex-1 bg-gray-300" />
        <h3 className="shrink-0 text-base font-extrabold uppercase tracking-wide text-gray-500">
          {title}
        </h3>
        <div className="h-[2px] flex-1 bg-gray-300" />
      </div>
    </div>
  );
};
