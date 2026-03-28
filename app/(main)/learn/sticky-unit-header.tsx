"use client";

import { useEffect, useRef, useState } from "react";

type UnitInfo = {
  id: number;
  title: string;
  description: string;
};

type StickyUnitHeaderProps = {
  units: UnitInfo[];
};

export const StickyUnitHeader = ({ units }: StickyUnitHeaderProps) => {
  const [currentUnit, setCurrentUnit] = useState<UnitInfo>(units[0]);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Find the last unit section that is intersecting or above viewport
        for (const entry of entries) {
          const unitId = Number(entry.target.getAttribute("data-unit-id"));
          const unit = units.find((u) => u.id === unitId);

          if (unit && entry.isIntersecting) {
            setCurrentUnit(unit);
          }
        }
      },
      {
        rootMargin: "-80px 0px -80% 0px",
        threshold: 0,
      }
    );

    // Observe all unit sections
    const sections = document.querySelectorAll("[data-unit-id]");
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [units]);

  if (!currentUnit) return null;

  return (
    <div
      ref={headerRef}
      className="sticky top-0 z-20 -mx-6 mb-4 bg-brand-navy px-6 py-4 text-white shadow-md"
    >
      <h2 className="text-lg font-bold lg:text-xl">{currentUnit.title}</h2>
      <p className="text-xs text-white/70 lg:text-sm">{currentUnit.description}</p>
    </div>
  );
};
