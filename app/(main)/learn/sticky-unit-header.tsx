"use client";

import { useEffect, useState } from "react";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

type UnitInfo = {
  id: number;
  order: number;
  title: string;
  description: string;
};

type StickyUnitHeaderProps = {
  units: UnitInfo[];
};

export const StickyUnitHeader = ({ units }: StickyUnitHeaderProps) => {
  const [currentUnit, setCurrentUnit] = useState<UnitInfo>(units[0]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const unitId = Number(entry.target.getAttribute("data-unit-id"));
          const unit = units.find((u) => u.id === unitId);
          if (unit) setCurrentUnit(unit);
        }
      },
      {
        rootMargin: "-120px 0px -70% 0px",
        threshold: 0,
      }
    );

    const sections = document.querySelectorAll("[data-unit-id]");
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [units]);

  if (!currentUnit) return null;

  return (
    <div className="sticky top-[50px] z-20 -mx-6 mb-2 rounded-b-xl bg-brand-navy px-5 py-3 text-white shadow-lg lg:top-0">
      <Link
        href="/courses"
        className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-white/60 transition-colors hover:text-white/90"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Unit {currentUnit.order}</span>
      </Link>
      <h2 className="truncate text-lg font-bold lg:text-xl">
        {currentUnit.title}
      </h2>
    </div>
  );
};
