import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

type HeaderProps = {
  title: string;
};

export const Header = ({ title }: HeaderProps) => {
  return (
    <>
      {/* Mobile: compact inline breadcrumb */}
      <div className="mb-3 flex items-center gap-2 lg:hidden">
        <Link href="/courses">
          <ArrowLeft className="h-4 w-4 text-brand-navy/50" />
        </Link>
        <span className="text-sm font-semibold text-brand-navy">{title}</span>
      </div>

      {/* Desktop: full breadcrumb row */}
      <div className="mb-5 hidden items-center justify-between pb-3 lg:flex">
        <Link href="/courses">
          <Button size="sm" variant="ghost" className="text-brand-navy/50 hover:text-brand-navy">
            <ArrowLeft className="mr-1 h-4 w-4 stroke-2" />
            <span className="text-xs">Topics</span>
          </Button>
        </Link>

        <h1 className="text-lg font-bold text-brand-navy">{title}</h1>
        <div className="w-[72px]" aria-hidden />
      </div>
    </>
  );
};
