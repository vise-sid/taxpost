import type { PropsWithChildren } from "react";

const AuthLayout = ({ children }: PropsWithChildren) => {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-[#1e2a78] via-[#232f85] to-[#1a237e]">
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-10">
        {children}
      </main>
    </div>
  );
};

export default AuthLayout;
