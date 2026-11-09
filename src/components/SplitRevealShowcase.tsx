'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { featuredProject } from '@/data/projects';
import { 
  Code2, 
  ExternalLink, 
  Eye, 
  Layers, 
  Maximize2, 
  Sliders, 
  Sparkles, 
  Terminal, 
  CheckCircle, 
  GitBranch, 
  Cpu
} from 'lucide-react';

export function SplitRevealShowcase() {
  const [sliderPos, setSliderPos] = useState<number>(35); // 35% code revealed, 65% design
  const [isDragging, setIsDragging] = useState(false);
  const [activeTabMobile, setActiveTabMobile] = useState<'finished' | 'build'>('finished');
  const containerRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation for slider
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      setSliderPos((prev) => Math.max(0, prev - 10));
    } else if (e.key === 'ArrowRight') {
      setSliderPos((prev) => Math.min(100, prev + 10));
    } else if (e.key === 'Home') {
      setSliderPos(0);
    } else if (e.key === 'End') {
      setSliderPos(100);
    }
  };

  // Pointer drag events for desktop
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPos(percentage);
    },
    [isDragging]
  );

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Ignored if already released
      }
    }
  };

  const toggleView = () => {
    // Toggles between predominantly finished (> 50%) and predominantly code (< 50%)
    setSliderPos((prev) => (prev > 50 ? 20 : 80));
  };

  return (
    <section id="showcase" className="relative border-b border-[#ede7de] bg-[#0d0f14] py-16 sm:py-20 lg:py-28 text-[#f0f3f8]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header: Dual Identity Context */}
        <div className="mb-10 sm:mb-14">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-[#b84218]" />
              <span className="font-mono-code text-xs font-semibold uppercase tracking-wider text-[#9da7b8]">
                Interactive Showcase • Flagship Study
              </span>
            </div>
            
            <a
              href={featuredProject.verifiedRepoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-mono-code text-xs text-[#9da7b8] transition-colors hover:text-[#f0f3f8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6] rounded-sm py-1 px-2 border border-[#1f2433] bg-[#11141c]"
            >
              <GitBranch className="h-3.5 w-3.5 text-[#b84218]" />
              <span>SaucesCode / {featuredProject.slug}</span>
              <ExternalLink className="h-3 w-3 ml-0.5 text-[#7d8ca6]" />
            </a>
          </div>

          <div className="mt-4 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <h2 className="text-3xl font-medium tracking-tight text-[#f0f3f8] sm:text-4xl lg:text-5xl">
                Finished Product <span className="text-[#7d8ca6] font-normal">↔</span> Behind the Build
              </h2>
              <p className="mt-3 max-w-2xl text-sm sm:text-base text-[#9da7b8] font-normal leading-relaxed">
                Most portfolios only show static screenshots or raw code. Drag the split divider below to inspect both:
                the luxury editorial storefront on the right and the underlying WordPress FSE architecture on the left.
              </p>
            </div>

            {/* Quick Action Button for Keyboard & Non-mouse Users */}
            <div className="hidden md:flex items-center gap-3">
              <button
                type="button"
                onClick={toggleView}
                className="inline-flex items-center gap-2 rounded-md border border-[#283247] bg-[#181d2a] px-3.5 py-2 text-xs font-mono-code font-medium text-[#f0f3f8] shadow-sm transition-colors hover:border-[#3b82f6] hover:bg-[#202738] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6]"
              >
                <Sliders className="h-3.5 w-3.5 text-[#b84218]" />
                <span>
                  {sliderPos > 50 ? 'Reveal Architecture (theme.json)' : 'Reveal Finished Product'}
                </span>
                <span className="text-[10px] text-[#7d8ca6] border border-[#283247] rounded px-1">↵</span>
              </button>
            </div>
          </div>

          {/* Mobile View Switcher (Clean tabs with 48px touch targets, preventing drag conflicts) */}
          <div className="mt-6 flex md:hidden w-full rounded-lg bg-[#11141c] p-1 border border-[#1f2433]">
            <button
              type="button"
              onClick={() => setActiveTabMobile('finished')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-semibold rounded-md transition-all ${
                activeTabMobile === 'finished'
                  ? 'bg-[#181d2a] text-[#f0f3f8] shadow-sm border border-[#283247]'
                  : 'text-[#9da7b8] hover:text-[#f0f3f8]'
              }`}
            >
              <Eye className="h-4 w-4 text-[#b84218]" />
              <span>Finished Product</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTabMobile('build')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-semibold rounded-md transition-all ${
                activeTabMobile === 'build'
                  ? 'bg-[#181d2a] text-[#f0f3f8] shadow-sm border border-[#283247]'
                  : 'text-[#9da7b8] hover:text-[#f0f3f8]'
              }`}
            >
              <Code2 className="h-4 w-4 text-[#3b82f6]" />
              <span>Behind the Build</span>
            </button>
          </div>
        </div>

        {/* ========================================================
            DESKTOP INTERACTIVE SPLIT CANVAS (>= 768px)
            ======================================================== */}
        <div 
          ref={containerRef}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="relative hidden md:block overflow-hidden rounded-xl border border-[#1f2433] bg-[#11141c] shadow-2xl select-none min-h-[580px]"
        >
          {/* LAYER 1 (BEHIND): Architecture & Code View (Behind the Build) */}
          <div className="absolute inset-0 bg-[#0d0f14] p-6 lg:p-8 flex flex-col justify-between">
            <div>
              {/* Window Bar */}
              <div className="flex items-center justify-between border-b border-[#1f2433] pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-[#e06c75]/80" />
                  <div className="h-3 w-3 rounded-full bg-[#e5c07b]/80" />
                  <div className="h-3 w-3 rounded-full bg-[#98c379]/80" />
                  <span className="ml-3 font-mono-code text-xs text-[#9da7b8] flex items-center gap-2">
                    <Terminal className="h-3.5 w-3.5 text-[#3b82f6]" />
                    {featuredProject.behindTheBuild.codeFilename}
                  </span>
                </div>
                <div className="font-mono-code text-[11px] text-[#7d8ca6]">
                  WordPress 6.7+ Full Site Editing Standard
                </div>
              </div>

              {/* Architecture Blueprint Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-6">
                  <div className="rounded-lg border border-[#1f2433] bg-[#151922] p-4">
                    <div className="flex items-center gap-2 mb-2 text-[#b84218] font-mono-code text-xs font-semibold uppercase">
                      <Cpu className="h-4 w-4" />
                      <span>{featuredProject.behindTheBuild.headline}</span>
                    </div>
                    <p className="text-xs text-[#9da7b8] leading-relaxed">
                      {featuredProject.behindTheBuild.architectureSummary}
                    </p>

                    <div className="mt-4 space-y-2 border-t border-[#1f2433] pt-3">
                      {featuredProject.behindTheBuild.verifiedCapabilities.map((cap, i) => (
                        <div key={i} className="flex items-center justify-between text-xs font-mono-code">
                          <span className="text-[#7d8ca6]">{cap.label}</span>
                          <span className="text-[#f0f3f8] font-medium">{cap.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Live Code Token Display */}
                <div className="lg:col-span-6">
                  <div className="rounded-lg border border-[#1f2433] bg-[#090b0e] p-4 font-mono-code text-xs text-[#9da7b8] overflow-x-auto leading-relaxed max-h-[360px]">
                    <pre className="text-[11px] leading-5">
                      <code>{featuredProject.behindTheBuild.codeSnippet}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Status Bar */}
            <div className="mt-6 pt-4 border-t border-[#1f2433] flex items-center justify-between text-xs font-mono-code text-[#7d8ca6]">
              <span>SPEC: WordPress Core FSE theme.json v3</span>
              <span className="text-[#10b981] flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5" /> Native Gutenberg Schema Valid
              </span>
            </div>
          </div>

          {/* LAYER 2 (FOREGROUND): Finished Product View (Clipped via clipPath) */}
          <div 
            className="absolute inset-0 bg-[#fbf9f5] text-[#161614] overflow-hidden transition-[clip-path] duration-75"
            style={{
              clipPath: `polygon(${sliderPos}% 0, 100% 0, 100% 100%, ${sliderPos}% 100%)`,
            }}
          >
            <div className="h-full p-6 lg:p-10 flex flex-col justify-between overflow-y-auto">
              <div>
                {/* Storefront Mock Browser Header */}
                <div className="flex items-center justify-between border-b border-[#dfdbd2] pb-4 mb-6">
                  <div className="flex items-center gap-3">
                    <span className="font-serif-editorial text-lg font-bold tracking-tight text-[#161614]">
                      THREAD &amp; FORM
                    </span>
                    <span className="text-xs text-[#747269] hidden lg:inline">
                      — Haute Horlogerie &amp; Tailored Silhouettes
                    </span>
                  </div>
                  <div className="font-mono-code text-xs font-semibold text-[#b84218]">
                    AUTUMN / WINTER 2026
                  </div>
                </div>

                {/* Editorial Storefront Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-7">
                    <div className="font-mono-code text-[11px] font-semibold text-[#747269] uppercase tracking-wider mb-2">
                      Editorial Block Pattern #04
                    </div>
                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-serif-editorial font-normal leading-tight text-[#161614]">
                      {featuredProject.finishedDetails.heroTitle}
                    </h3>
                    <p className="mt-3 text-sm text-[#58564e] leading-relaxed max-w-xl">
                      {featuredProject.finishedDetails.heroSubtitle}
                    </p>

                    <div className="mt-6 flex flex-wrap gap-2">
                      {featuredProject.finishedDetails.features.map((feature, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 rounded-full border border-[#dfdbd2] bg-[#f2eee7] px-3 py-1 text-xs font-medium text-[#161614]"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-[#b84218]" />
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Product Card Sample */}
                  <div className="lg:col-span-5">
                    <div className="rounded-xl border border-[#dfdbd2] bg-[#ffffff] p-5 shadow-sm">
                      <div className="relative aspect-4/3 w-full rounded-lg bg-[#f2eee7] flex items-center justify-center p-4 border border-[#ede7de]">
                        <div className="text-center">
                          <span className="font-serif-editorial text-xl italic text-[#58564e]">
                            Minimalist Wool Overcoat
                          </span>
                          <p className="mt-1 font-mono-code text-xs text-[#747269]">
                            {featuredProject.finishedDetails.priceSample}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between text-xs text-[#747269]">
                        <span>Full Site Editing Compatible</span>
                        <span className="text-[#161614] font-semibold">100% Gutenberg Block</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Editorial Caption */}
              <div className="mt-8 pt-4 border-t border-[#ede7de] flex items-center justify-between text-xs text-[#747269]">
                <span>Client Benefit: Instant visual editing without code or slow page builders</span>
                <span className="font-mono-code text-[#161614] font-semibold">PHP 8.3 • WP 6.7+</span>
              </div>
            </div>
          </div>

          {/* DRAGGABLE DIVIDER CURTAIN HANDLE */}
          <div
            className="absolute top-0 bottom-0 z-30 w-1 cursor-ew-resize bg-[#b84218] transition-colors focus:outline-none"
            style={{ left: `${sliderPos}%` }}
            onPointerDown={handlePointerDown}
            tabIndex={0}
            role="slider"
            aria-label="Split view divider: Left reveals architecture, right reveals finished product"
            aria-valuenow={Math.round(sliderPos)}
            aria-valuemin={0}
            aria-valuemax={100}
            onKeyDown={handleKeyDown}
          >
            {/* Grab Handle Pill */}
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex items-center justify-center">
              <div className="flex items-center gap-1.5 rounded-full border border-[#f0f3f8] bg-[#161614] px-3 py-1.5 text-[11px] font-mono-code font-bold tracking-wider text-[#f0f3f8] shadow-xl hover:scale-105 active:scale-95 transition-transform">
                <span className="text-[#3b82f6]">CODE</span>
                <span>⇄</span>
                <span className="text-[#b84218]">DESIGN</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            MOBILE SINGLE-MODE CARDS (< 768px)
            ======================================================== */}
        <div className="block md:hidden">
          {activeTabMobile === 'finished' ? (
            /* Mobile Finished Product Card */
            <div className="rounded-xl border border-[#dfdbd2] bg-[#fbf9f5] p-6 text-[#161614] shadow-lg">
              <div className="flex items-center justify-between border-b border-[#dfdbd2] pb-3 mb-4">
                <span className="font-serif-editorial text-base font-bold text-[#161614]">
                  THREAD &amp; FORM
                </span>
                <span className="font-mono-code text-xs text-[#b84218] font-semibold">
                  A/W 2026
                </span>
              </div>

              <h3 className="text-xl font-serif-editorial font-normal leading-snug text-[#161614]">
                {featuredProject.finishedDetails.heroTitle}
              </h3>
              <p className="mt-2 text-xs text-[#58564e] leading-relaxed">
                {featuredProject.finishedDetails.heroSubtitle}
              </p>

              <div className="my-5 rounded-lg border border-[#dfdbd2] bg-white p-4">
                <div className="aspect-16/9 rounded bg-[#f2eee7] flex items-center justify-center text-center p-3">
                  <span className="font-serif-editorial text-base italic text-[#58564e]">
                    Minimalist Wool Overcoat
                  </span>
                </div>
                <div className="mt-2 flex justify-between text-xs font-mono-code">
                  <span className="text-[#747269]">{featuredProject.finishedDetails.priceSample}</span>
                  <span className="text-[#10b981] font-semibold">Gutenberg Block</span>
                </div>
              </div>

              <div className="space-y-2">
                {featuredProject.finishedDetails.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-[#58564e]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#b84218]" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-3 border-t border-[#ede7de] flex items-center justify-between text-xs text-[#747269]">
                <span>Zero Plugin Lock-in</span>
                <span className="font-mono-code text-[#161614]">WordPress 6.7+ FSE</span>
              </div>
            </div>
          ) : (
            /* Mobile Behind the Build Card */
            <div className="rounded-xl border border-[#1f2433] bg-[#11141c] p-6 text-[#f0f3f8] shadow-lg">
              <div className="flex items-center justify-between border-b border-[#1f2433] pb-3 mb-4">
                <span className="font-mono-code text-xs text-[#3b82f6] flex items-center gap-1.5 font-semibold">
                  <Terminal className="h-3.5 w-3.5" />
                  theme.json
                </span>
                <span className="font-mono-code text-[11px] text-[#7d8ca6]">
                  v3 Schema
                </span>
              </div>

              <h3 className="text-base font-semibold text-[#f0f3f8] mb-1">
                {featuredProject.behindTheBuild.headline}
              </h3>
              <p className="text-xs text-[#9da7b8] leading-relaxed mb-4">
                {featuredProject.behindTheBuild.architectureSummary}
              </p>

              <div className="rounded-lg border border-[#1f2433] bg-[#090b0e] p-3 font-mono-code text-[11px] text-[#9da7b8] overflow-x-auto mb-4">
                <pre>
                  <code>{featuredProject.behindTheBuild.codeSnippet}</code>
                </pre>
              </div>

              <div className="space-y-2 border-t border-[#1f2433] pt-3 text-xs font-mono-code">
                {featuredProject.behindTheBuild.verifiedCapabilities.map((cap, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-[#7d8ca6]">{cap.label}:</span>
                    <span className="text-[#f0f3f8]">{cap.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Project Summary Strip */}
        <div className="mt-8 rounded-lg border border-[#1f2433] bg-[#11141c] p-4 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-semibold text-[#f0f3f8]">
              Why this architecture matters for client commercial results:
            </h4>
            <p className="text-xs text-[#9da7b8] mt-1 max-w-3xl">
              {featuredProject.clientBenefit}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={featuredProject.verifiedRepoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md bg-[#b84218] px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#9a3412] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6]"
            >
              <span>Inspect Source Repository</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
