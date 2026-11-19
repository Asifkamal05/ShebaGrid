"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { PERSONAS, ROLE_LABEL } from "@/lib/people";
import { useSession } from "@/lib/store/hooks";
import type { Role } from "@/lib/types";

interface Props {
  /** Who may see this page. */
  allow: Role[];
  /** What the page is, used in the messages: "your complaints". */
  subject: string;
  children: ReactNode;
}

/** Keeps a page for the roles it is meant for. Checked in the browser, so not real security. */
export function RoleGate({ allow, subject, children }: Props) {
  const { hydrated, role } = useSession();
  const pathname = usePathname();
  const next = encodeURIComponent(pathname);

  if (!hydrated) return null;
  if (role && allow.includes(role)) return <>{children}</>;

  const audience = allow.includes("resident") ? "residents" : "engineers and officials";

  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
      <div className="border-l-[6px] border-survey bg-panel p-6 shadow-lift sm:p-8">
        <h1 className="text-3xl font-bold sm:text-4xl">
          {role ? `This page is for ${audience}` : `Sign in to see ${subject}`}
        </h1>
        <p className="mt-3 text-lg text-muted">
          {role
            ? `You are signed in as ${PERSONAS[role].name}, ${ROLE_LABEL[role].toLowerCase()}.`
            : `${subject.charAt(0).toUpperCase()}${subject.slice(1)} is for signed-in ${audience}.`}
        </p>
        <Link
          href={`/login?next=${next}`}
          className="mt-6 inline-block rounded-ui bg-brand px-6 py-3 text-lg font-semibold text-white hover:bg-brand-deep"
        >
          {role ? "Switch account" : "Sign in"}
        </Link>
      </div>
    </div>
  );
}
