"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "@kumu/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { BookOpen, ChevronRight, Settings, TriangleAlert } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import circleBubble from "../../../public/circle-bubble.png";

function getInitials(name?: string | null, email?: string | null) {
  if (name) {
    const parts = name.trim().split(/\s+/);
    return parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }
  if (email) return email[0].toUpperCase();
  return "?";
}

function formatDate(ts?: number) {
  if (!ts) return null;
  return new Date(ts).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

const menuItems = [
  {
    icon: BookOpen,
    label: "Product History",
    href: "/history",
  },
  {
    icon: TriangleAlert,
    label: "Reported Alerts",
    href: "/alerts",
  },
  {
    icon: Settings,
    label: "Account Settings",
    href: "/settings",
  },
];

export default function ProfilePage() {
  const router = useRouter();
  const { signOut } = useAuthActions();
  const profile = useQuery(api.users.currentProfile);

  const initials = useMemo(
    () => getInitials(profile?.name, profile?.email),
    [profile?.name, profile?.email],
  );

  const memberSince = formatDate(profile?.createdAt);

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-100">
      {/* background blobs */}

      <div className="relative mx-auto flex min-h-screen max-w-lg flex-col px-5 py-10">
        <h1 className="mb-8 text-2xl font-semibold text-slate-500">Profile</h1>

        {/* avatar card */}
        <div className="mb-8 overflow-hidden rounded-3xl bg-white shadow-sm">
          <div className="flex flex-col items-center gap-3 bg-gradient-to-b from-blue-50 to-white px-6 py-10">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-indigo-500 text-3xl font-bold text-white shadow-md">
              {initials}
            </div>
            <div className="text-center">
              <p className="text-xl font-semibold text-slate-800">
                {profile?.name ?? "Loading…"}
              </p>
              {memberSince && (
                <p className="mt-1 text-sm text-slate-400">
                  Account since: {memberSince}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* menu items */}
        <div className="mb-10 flex flex-col gap-3">
          {menuItems.map(({ icon: Icon, label, href }) => (
            <button
              key={label}
              onClick={() => router.push(href)}
              className="flex w-full items-center gap-4 rounded-2xl bg-white px-5 py-4 text-left shadow-sm transition hover:bg-slate-50 active:scale-[0.99]"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                <Icon className="h-5 w-5 text-slate-700" strokeWidth={1.8} />
              </div>
              <span className="flex-1 text-base font-medium text-slate-800">
                {label}
              </span>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </button>
          ))}
        </div>

        {/* log out */}
        <div className="flex justify-center">
          <button
            onClick={() => signOut().then(() => router.push("/sign-in"))}
            className="text-sm font-medium text-rose-500 underline underline-offset-2 transition hover:text-rose-400"
          >
            Log Out
          </button>
        </div>

        {/* mascot */}
        <div className="pointer-events-none absolute right-4 bottom-8 opacity-90">
          <Image
            src={circleBubble}
            alt=""
            width={72}
            height={72}
            className="drop-shadow-md"
          />
        </div>
      </div>
    </main>
  );
}
