type UnitBannerProps = {
  title: string;
  description: string;
};

export const UnitBanner = ({ title, description }: UnitBannerProps) => {
  return (
    <div className="flex w-full items-center justify-between rounded-xl bg-brand-navy p-5 text-white">
      <div className="space-y-1.5">
        <h3 className="text-2xl font-bold">{title}</h3>
        <p className="text-sm text-white/80 lg:text-lg">{description}</p>
      </div>
    </div>
  );
};
