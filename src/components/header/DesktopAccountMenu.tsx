"use client";

import type { RefObject } from "react";
import Link from "next/link";
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { useTranslations } from "next-intl";

interface SessionLike {
  user?: {
    name?: string | null;
    email?: string | null;
  } | null;
}

interface DesktopAccountMenuProps {
  status: string;
  session: SessionLike | null | undefined;
  isUserMenuOpen: boolean;
  setIsUserMenuOpen: (value: boolean) => void;
  setIsLoginModalOpen: (value: boolean) => void;
  userMenuRef: RefObject<HTMLDivElement | null>;
}

export default function DesktopAccountMenu({
  status,
  session,
  isUserMenuOpen,
  setIsUserMenuOpen,
  setIsLoginModalOpen,
  userMenuRef,
}: DesktopAccountMenuProps) {
  const t = useTranslations("auditI18n.header");

  return (
    <div className="hidden sm:block relative" ref={userMenuRef}>
      {status === "authenticated" ? (
        <>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="interactive-focus flex items-center gap-2 px-3 py-2.5 rounded-xl
                                                 bg-accent/10 hover:bg-accent/20 text-accent
                                                 border border-accent/20 hover:border-accent/40
                                                 transition-all duration-300 font-semibold text-sm whitespace-nowrap shrink-0"
            aria-haspopup="true"
            aria-expanded={isUserMenuOpen}
          >
            <div className="tone-brand-gradient flex h-7 w-7 items-center justify-center rounded-full border text-[11px] text-white shadow-sm">
              {session?.user?.name?.[0] ||
                session?.user?.email?.[0]?.toUpperCase()}
            </div>
            <span>{t('account')}</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${isUserMenuOpen ? "rotate-180" : ""}`}
            />
          </button>

          {isUserMenuOpen && (
            <div className="absolute top-[calc(100%+0.5rem)] right-0 w-56 glass-strong rounded-2xl border border-default shadow-xl p-2 animate-fade-in-up">
              <div className="px-3 py-2 mb-2 border-b border-default">
                <p className="text-sm font-medium text-theme-primary truncate">
                  {session?.user?.name || t('userFallback')}
                </p>
                <p className="text-xs text-theme-muted truncate">
                  {session?.user?.email}
                </p>
              </div>
              <Link
                href="/dashboard"
                onClick={() => setIsUserMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-theme-secondary hover:text-accent hover:bg-accent/5 transition-colors font-medium"
              >
                <LayoutDashboard className="w-4 h-4" />
                {t('dashboard')}
              </Link>
              <button
                onClick={() => signOut()}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-500 hover:bg-rose-500/10 transition-colors mt-1"
              >
                <LogOut className="w-4 h-4" />
                {t('signOut')}
              </button>
            </div>
          )}
        </>
      ) : (
        <button
          onClick={() => setIsLoginModalOpen(true)}
          className="interactive-focus flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap shrink-0
                                             text-theme-primary border border-default hover:bg-slate-50 dark:hover:bg-slate-800
                                             hover:text-accent hover:border-accent/30 hover:shadow-sm transition-all duration-300 active:scale-95"
        >
          <UserIcon className="w-4 h-4" />
          {t('signIn')}
        </button>
      )}
    </div>
  );
}
