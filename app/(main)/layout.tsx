import type { PropsWithChildren } from "react";

import { MobileHeader } from "@/components/mobile-header";
import { MobileNav } from "@/components/mobile-nav";
import { Sidebar } from "@/components/sidebar";

const MainLayout = ({ children }: PropsWithChildren) => {
  return (
    <>
      <MobileHeader />
      <Sidebar className="hidden lg:flex" />
      <main className="h-full pb-[70px] pt-[50px] lg:pb-0 lg:pl-[256px] lg:pt-0">
        <div className="mx-auto h-full max-w-[1056px] pt-0 lg:pt-6">{children}</div>
      </main>
      <MobileNav />
    </>
  );
};

export default MainLayout;
