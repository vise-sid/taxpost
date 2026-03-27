import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

type HeaderProps = {
  title: string;
};

export const Header = ({ title }: HeaderProps) => {
  return (
    <div className="mb-5 flex items-center justify-between pb-3 text-neutral-400">
      <Link href="/courses">
        <Button size="sm" variant="ghost" className="text-brand-navy/50 hover:text-brand-navy">
          <ArrowLeft className="mr-1 h-4 w-4 stroke-2" />
          <span className="text-xs">Topics</span>
        </Button>
      </Link>

      <h1 className="text-lg font-bold text-brand-navy">{title}</h1>
      <div className="w-[72px]" aria-hidden />
    </div>
  );
};
