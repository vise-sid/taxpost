import { Button } from "@/components/ui/button";

export const Footer = () => {
  return (
    <div className="hidden h-20 w-full border-t-2 border-slate-200 p-2 lg:block">
      <div className="mx-auto flex h-full max-w-screen-lg items-center justify-evenly">
        <Button size="lg" variant="ghost" className="w-full cursor-default">
          Income Tax Act 2025
        </Button>

        <Button size="lg" variant="ghost" className="w-full cursor-default">
          GST
        </Button>

        <Button size="lg" variant="ghost" className="w-full cursor-default">
          TDS / TCS
        </Button>

        <Button size="lg" variant="ghost" className="w-full cursor-default">
          International Tax
        </Button>

        <Button size="lg" variant="ghost" className="w-full cursor-default">
          Audit &amp; Compliance
        </Button>
      </div>
    </div>
  );
};
