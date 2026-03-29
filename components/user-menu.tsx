"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export const UserMenu = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  if (!user) return null;

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");
  const displayName =
    fullName || (user.emailAddresses[0]?.emailAddress ?? "User");
  const email = user.emailAddresses[0]?.emailAddress ?? "";

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <div className="flex items-center gap-3">
      {/* Avatar */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-navy">
        {user.imageUrl ? (
          <img
            src={user.imageUrl}
            alt={displayName}
            className="h-9 w-9 rounded-full object-cover"
          />
        ) : (
          <span className="text-sm font-bold text-white">
            {(user.firstName?.[0] ?? email[0] ?? "U").toUpperCase()}
          </span>
        )}
      </div>

      {/* Name + email */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-neutral-800">
          {displayName}
        </p>
        <p className="truncate text-xs text-neutral-500">{email}</p>
      </div>

      {/* Sign out */}
      <button
        onClick={handleSignOut}
        title="Sign out"
        className="shrink-0 rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );
};
