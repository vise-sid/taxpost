import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { courses } from "@/db/schema";
import { CourseIcon } from "@/lib/course-icons";

type UserProgressProps = {
  activeCourse: typeof courses.$inferSelect;
  hearts: number;
  points: number;
};

export const UserProgress = ({
  activeCourse,
  hearts,
  points,
}: UserProgressProps) => {
  return (
    <div className="flex w-full items-center justify-between gap-x-2">
      <Link href="/courses">
        <Button variant="ghost">
          <CourseIcon imageSrc={activeCourse.imageSrc} size="sm" />
        </Button>
      </Link>

      <Link href="/shop">
        <Button variant="ghost" className="text-orange-500">
          <Image
            src="/points.svg"
            height={28}
            width={28}
            alt="Points"
            className="mr-2"
          />
          {points}
        </Button>
      </Link>

      <Link href="/shop">
        <Button variant="ghost" className="text-rose-500">
          <Image
            src="/heart.svg"
            height={22}
            width={22}
            alt="Hearts"
            className="mr-2"
          />
          {hearts}
        </Button>
      </Link>
    </div>
  );
};
