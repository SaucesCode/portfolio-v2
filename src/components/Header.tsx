'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Menu, X } from 'lucide-react';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#ede7de] bg-[#fbf9f5]/90 backdrop-blur-md transition-colors duration-200">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand Stamp & Monogram */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="group flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fbf9f5] rounded-sm"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-[#161614] text-[#fbf9f5] shadow-sm transition-transform duration-150 group-hover:scale-105">
              <span className="font-serif-editorial text-base font-bold tracking-tight">JM</span>
            </div>
            <div>
              <div className="font-serif-editorial text-base font-bold tracking-tight text-[#161614] sm:text-lg">
                JAMES DE MESA
              </div>
              <div className="font-mono-code text-[9px] font-medium tracking-wider text-[#747269] uppercase">
                Digital Craft // Web Systems
              </div>
            </div>
          </Link>
        </div>

        {/* Availability Pill (Desktop) */}
        <div className="hidden lg:flex items-center gap-2 rounded-full border border-[#dfdbd2] bg-[#f2eee7] px-3.5 py-1 shadow-2xs">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#10b981] opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#10b981]"></span>
          </span>
          <span className="font-mono-code text-[10px] font-semibold tracking-wider text-[#46443e] uppercase">
            Open to Select Contract &amp; Full-Stack Roles
          </span>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-semibold uppercase tracking-wider text-[#58564e]">
          <a
            href="#showcase"
            className="transition-colors hover:text-[#b84218] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6]"
          >
            Featured Work
          </a>
          <a
            href="#services"
            className="transition-colors hover:text-[#b84218] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6]"
          >
            Services
          </a>
          <a
            href="#process"
            className="transition-colors hover:text-[#b84218] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6]"
          >
            Process
          </a>
          <a
            href="https://github.com/SaucesCode"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-[#b84218] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6]"
          >
            GitHub ↗
          </a>
        </nav>

        {/* CTA & Mobile Menu Button */}
        <div className="flex items-center gap-3">
          <a
            href="#contact"
            className="group hidden sm:inline-flex items-center gap-2 rounded-full bg-[#b84218] px-4 py-2 text-xs font-semibold text-white shadow-xs transition-all duration-150 hover:bg-[#9a3412] hover:shadow-sm active:scale-98 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6] focus-visible:ring-offset-2"
          >
            <span>Start a Project</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-1" />
          </a>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#dfdbd2] bg-white text-[#161614] md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6]"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="border-b border-[#dfdbd2] bg-[#fbf9f5] px-4 pt-3 pb-6 md:hidden">
          <div className="mb-4 flex items-center gap-2 rounded-full border border-[#dfdbd2] bg-[#f2eee7] px-3 py-1">
            <span className="h-2 w-2 rounded-full bg-[#10b981]"></span>
            <span className="font-mono-code text-[10px] font-semibold text-[#46443e] uppercase">
              Open to Select Projects
            </span>
          </div>
          <nav className="flex flex-col gap-3 text-sm font-semibold text-[#161614]">
            <a
              href="#showcase"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 transition-colors hover:text-[#b84218]"
            >
              Featured Work
            </a>
            <a
              href="#services"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 transition-colors hover:text-[#b84218]"
            >
              Services &amp; Capabilities
            </a>
            <a
              href="#process"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 transition-colors hover:text-[#b84218]"
            >
              Collaboration Process
            </a>
            <a
              href="https://github.com/SaucesCode"
              target="_blank"
              rel="noopener noreferrer"
              className="py-1.5 transition-colors hover:text-[#b84218]"
            >
              GitHub Profile (SaucesCode) ↗
            </a>
            <div className="pt-2">
              <a
                href="#contact"
                onClick={() => setMobileMenuOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#b84218] py-2.5 text-xs font-semibold text-white"
              >
                <span>Start a Project</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
