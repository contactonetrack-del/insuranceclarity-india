"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useRef, type ComponentType } from "react";
import {
  resolveToneSurfaceClass,
  type Tone,
  type Surface,
} from "@/lib/theme/tone";

interface NavDropdownProps {
  label: string;
  id: string;
  items: Array<{
    href: string;
    label: string;
    description: string;
    icon: ComponentType<{ className?: string; strokeWidth?: number }>;
    tone: Tone;
    surface: Surface;
  }>;
  activeDropdown: string | null;
  setActiveDropdown: (id: string | null) => void;
}

export default function NavDropdown({
  label,
  id,
  items,
  activeDropdown,
  setActiveDropdown,
}: NavDropdownProps) {
  const isOpen = activeDropdown === id;
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const open = () => setActiveDropdown(id);
  const close = () => {
    setActiveDropdown(null);
    buttonRef.current?.focus();
  };
  const toggle = () => (isOpen ? close() : open());

  // Keyboard: Escape closes, arrow keys navigate menu items
  const handleButtonKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      close();
      return;
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      open();
      setTimeout(() => {
        (
          menuRef.current?.querySelector('[role="menuitem"]') as HTMLElement
        )?.focus();
      }, 50);
    }
  };

  const handleMenuKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const items = Array.from(
      menuRef.current?.querySelectorAll('[role="menuitem"]') ?? [],
    ) as HTMLElement[];
    const idx = items.indexOf(document.activeElement as HTMLElement);
    if (e.key === "Escape") {
      close();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      items[Math.min(idx + 1, items.length - 1)]?.focus();
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (idx === 0) {
        close();
      } else {
        items[idx - 1]?.focus();
      }
    }
    if (e.key === "Tab") {
      close();
    }
  };

  return (
    <div
      className="relative h-full flex items-center shrink-0"
      onMouseEnter={open}
      onMouseLeave={close}
    >
      <button
        ref={buttonRef}
        className={`interactive-focus flex items-center gap-1.5 rounded-xl px-1.5 text-sm transition-colors duration-200 group relative py-2 whitespace-nowrap
                           ${isOpen ? "text-accent font-semibold" : "text-slate-700 hover:text-accent dark:text-slate-200 dark:hover:text-accent font-medium"}`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={`dropdown-${id}`}
        onClick={toggle}
        onKeyDown={handleButtonKeyDown}
      >
        {label}
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180 text-accent" : "text-slate-400 dark:text-slate-400 group-hover:text-accent"}`}
          aria-hidden="true"
        />
        {/* Premium Hover Underline */}
        <span
          className={`absolute bottom-0 left-0 h-0.5 bg-accent transition-all duration-300 rounded-full
                                 ${isOpen ? "w-full opacity-100" : "w-0 opacity-0 group-hover:w-full group-hover:opacity-100"}`}
        />
      </button>

      {isOpen && (
        <div
          id={`dropdown-${id}`}
          className={`absolute top-[calc(100%+0.5rem)] start-1/2 -translate-x-1/2 z-50`}
          ref={menuRef}
          role="menu"
          aria-label={`${label} submenu`}
          onKeyDown={handleMenuKeyDown}
        >
          {/* Invisible bridge gap */}
          <div className="absolute -top-4 left-0 w-full h-4" />

          <div
            className={`p-4 rounded-2xl shadow-2xl animate-fade-in-up bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800
                                    ${
                                      id === "personal-insurance"
                                        ? "w-[640px] grid grid-cols-2 gap-x-4 gap-y-2"
                                        : id === "business-insurance"
                                          ? "w-[560px] grid grid-cols-2 gap-x-4 gap-y-2"
                                          : "w-80 grid gap-y-2"
                                    }`}
          >
            {items.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                role="menuitem"
                tabIndex={0}
                className="interactive-focus group flex flex-row items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200"
                style={{ animationDelay: `${index * 20}ms` }}
                onClick={close}
              >
                <div
                  className={`w-11 h-11 shrink-0 rounded-xl border ${resolveToneSurfaceClass(item.tone, item.surface)}
                                                 flex items-center justify-center shadow-md shadow-slate-200/50 dark:shadow-none
                                                 group-hover:scale-105 transition-transform duration-300`}
                  aria-hidden="true"
                >
                  <item.icon className="w-5 h-5 text-white" strokeWidth={2} />
                </div>
                <div className="flex-1">
                  <span className="block font-semibold text-sm text-slate-900 dark:text-slate-100 group-hover:text-accent transition-colors">
                    {item.label}
                  </span>
                  <span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1 opacity-80">
                    {item.description}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
