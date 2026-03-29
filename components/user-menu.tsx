"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { LogOut, Settings, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export const UserMenu = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  const nameInitials = (user.firstName?.[0] ?? "") + (user.lastName?.[0] ?? "");
  const initials =
    nameInitials ||
    (user.emailAddresses[0]?.emailAddress?.[0]?.toUpperCase() ?? "U");

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");
  const displayName =
    fullName || (user.emailAddresses[0]?.emailAddress ?? "User");

  const email = user.emailAddresses[0]?.emailAddress ?? "";

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-navy text-sm font-bold text-white transition-all hover:ring-2 hover:ring-brand-navy/30"
      >
        {user.imageUrl ? (
          <img
            src={user.imageUrl}
            alt={displayName}
            className="h-9 w-9 rounded-full object-cover"
          />
        ) : (
          initials
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute bottom-full left-0 mb-2 w-64 animate-fade-in rounded-xl border border-neutral-200 bg-white shadow-lg lg:bottom-auto lg:left-auto lg:right-0 lg:top-full lg:mb-0 lg:mt-2">
          {/* User info */}
          <div className="border-b border-neutral-100 px-4 py-3">
            <p className="text-sm font-semibold text-neutral-800 truncate">
              {displayName}
            </p>
            <p className="text-xs text-neutral-500 truncate">{email}</p>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 transition-colors hover:bg-neutral-50"
            >
              <Settings className="h-4 w-4 text-neutral-400" />
              Settings
            </Link>

            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 transition-colors hover:bg-neutral-50"
            >
              <LogOut className="h-4 w-4 text-neutral-400" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
