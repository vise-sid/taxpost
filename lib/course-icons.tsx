import {
  BookOpen,
  TrendingUp,
  Briefcase,
  Home,
  Building2,
  Receipt,
  ShieldCheck,
  FileText,
  type LucideIcon,
} from "lucide-react";

type CourseIconConfig = {
  icon: LucideIcon;
  bg: string;
  text: string;
};

const courseIconMap: Record<string, CourseIconConfig> = {
  "/tds.svg": { icon: Receipt, bg: "bg-blue-100", text: "text-blue-600" },
  "/capital-gains.svg": { icon: TrendingUp, bg: "bg-emerald-100", text: "text-emerald-600" },
  "/salary.svg": { icon: Briefcase, bg: "bg-orange-100", text: "text-orange-600" },
  "/house-property.svg": { icon: Home, bg: "bg-violet-100", text: "text-violet-600" },
  "/business.svg": { icon: Building2, bg: "bg-amber-100", text: "text-amber-600" },
  "/deductions.svg": { icon: ShieldCheck, bg: "bg-teal-100", text: "text-teal-600" },
  "/exempt-income.svg": { icon: FileText, bg: "bg-rose-100", text: "text-rose-600" },
  "/basics.svg": { icon: BookOpen, bg: "bg-indigo-100", text: "text-indigo-600" },
};

const defaultConfig: CourseIconConfig = {
  icon: BookOpen,
  bg: "bg-gray-100",
  text: "text-gray-600",
};

export function getCourseIconConfig(imageSrc: string): CourseIconConfig {
  return courseIconMap[imageSrc] || defaultConfig;
}

type CourseIconProps = {
  imageSrc: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses = {
  sm: { wrapper: "h-8 w-8 rounded-lg", icon: "h-4 w-4" },
  md: { wrapper: "h-16 w-16 rounded-xl", icon: "h-8 w-8" },
  lg: { wrapper: "h-20 w-20 rounded-2xl", icon: "h-10 w-10" },
};

export function CourseIcon({ imageSrc, size = "md", className = "" }: CourseIconProps) {
  const config = getCourseIconConfig(imageSrc);
  const Icon = config.icon;
  const sizes = sizeClasses[size];

  return (
    <div className={`flex items-center justify-center ${config.bg} ${sizes.wrapper} ${className}`}>
      <Icon className={`${config.text} ${sizes.icon}`} />
    </div>
  );
}
