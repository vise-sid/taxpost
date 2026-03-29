import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4 text-center">
      <h1 className="text-4xl font-extrabold text-neutral-800">404</h1>
      <p className="text-neutral-500">
        This page doesn&apos;t exist.
      </p>
      <Link
        href="/learn"
        className="mt-2 rounded-xl bg-neutral-800 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-neutral-700"
      >
        Back to Learn
      </Link>
    </div>
  );
}
