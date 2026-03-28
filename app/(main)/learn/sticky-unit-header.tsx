"use client";

import { useEffect, useState } from "react";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

type UnitInfo = {
  id: number;
  order: number;
  title: string;
  description: string;
};

type StickyUnitHeaderProps = {
  units: UnitInfo[];
  courseName: string;
};

// Rotating colors for each unit — vibrant like Duolingo
const unitColors = [
  "bg-[#1a237e]",   // navy (brand)
  "bg-[#7c3aed]",   // purple
  "bg-[#0891b2]",   // teal
  "bg-[#c2410c]",   // burnt orange
  "bg-[#0d9488]",   // emerald
  "bg-[#be185d]",   // pink
  "bg-[#1d4ed8]",   // blue
  "bg-[#7c2d12]",   // brown
];

export const StickyUnitHeader = ({ units, courseName }: StickyUnitHeaderProps) => {
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

  const unitIndex = units.findIndex((u) => u.id === currentUnit.id);
  const bgColor = unitColors[unitIndex % unitColors.length];

  return (
    <div className="sticky top-[50px] z-20 -mx-6 lg:top-6 lg:mx-0 lg:mb-4">
      <div
        className={cn(
          "px-5 py-4 text-white transition-colors duration-300 lg:rounded-2xl lg:shadow-lg",
          bgColor
        )}
      >
        <Link
          href="/courses"
          className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-white/60 transition-colors hover:text-white/90"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>{courseName}, Unit {currentUnit.order}</span>
        </Link>
        <h2 className="text-lg font-bold leading-tight lg:text-xl">
          {currentUnit.title}
        </h2>
      </div>
    </div>
  );
};
