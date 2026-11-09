'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowDown, ArrowUpRight, CheckCircle2, Code2, Globe, Layers, Sparkles } from 'lucide-react';

export function Hero() {
  const [activePillar, setActivePillar] = useState<'all' | 'wordpress' | 'fullstack' | 'ecommerce'>('all');

  const pillars = [
    {
      id: 'wordpress' as const,
      label: 'Custom WordPress & FSE',
      tag: 'Bespoke Block Themes',
      accent: 'border-[#b84218]/30 hover:border-[#b84218] text-[#b84218]',
      activeClass: 'bg-[#b84218]/10 border-[#b84218] text-[#b84218]',
      description: 'Zero bloated plugins. Native Gutenberg blocks with pure theme.json tokens and fluid typography.',
    },
    {
      id: 'fullstack' as const,
      label: 'Full-Stack Web Systems',
      tag: 'Next.js & Cloud Architecture',
      accent: 'border-[#3b82f6]/30 hover:border-[#3b82f6] text-[#3b82f6]',
      activeClass: 'bg-[#3b82f6]/10 border-[#3b82f6] text-[#2563eb]',
      description: 'End-to-end web apps with Next.js 16 Active LTS, TypeScript, rigorous validation, and server caching.',
    },
    {
      id: 'ecommerce' as const,
      label: 'E-Commerce & High-Converting Landing',
      tag: 'Speed & Conversion',
      accent: 'border-[#10b981]/30 hover:border-[#10b981] text-[#10b981]',
      activeClass: 'bg-[#10b981]/10 border-[#10b981] text-[#059669]',
      description: 'Fast, frictionless checkout flows, bespoke editorial product lookbooks, and high-impact digital experiences.',
    },
  ];

  return (
    <section className="relative overflow-hidden border-b border-[#ede7de] bg-[#fbf9f5] pt-12 pb-16 md:pt-20 md:pb-24 lg:pt-28 lg:pb-32">
      {/* Subtle Background Architectural Texture / Grid Accent */}
      <div 
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `radial-gradient(#161614 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top Registration / Identification Stamp */}
        <div className="mb-6 flex flex-wrap items-center gap-3 text-[11px] font-mono-code uppercase tracking-wider text-[#747269]">
          <span className="flex items-center gap-1.5 rounded-sm bg-[#f2eee7] border border-[#dfdbd2] px-2.5 py-1 text-[#161614] font-semibold">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#b84218]" />
            JM / 01 • SYSTEM ATLAS
          </span>
          <span className="hidden sm:inline-block text-[#c2bcb0]">•</span>
          <span>MANILA, PH (UTC+8)</span>
          <span className="hidden sm:inline-block text-[#c2bcb0]">•</span>
          <span className="text-[#58564e]">FREELANCE &amp; SELECT CONTRACT</span>
        </div>

        {/* Main Editorial Hero Headline */}
        <div className="max-w-5xl">
          <h1 className="text-4xl font-normal tracking-tight text-[#161614] sm:text-5xl md:text-6xl lg:text-7xl leading-[1.08]">
            Engineering{' '}
            <span className="font-serif-editorial italic font-normal text-[#b84218]">
              tailored web platforms
            </span>
            , bespoke WordPress themes, and high-impact digital systems.
          </h1>

          <p className="mt-6 max-w-3xl text-base text-[#58564e] sm:text-lg md:text-xl font-normal leading-relaxed">
            I partner directly with founders, creative studios, and ambitious businesses to turn complex requirements into
            fast, resilient, and beautifully crafted digital products. Clean architecture on the inside, effortless elegance on the surface.
          </p>
        </div>

        {/* 3 Core Commercial Pillars / Interactive Filter Cards */}
        <div className="mt-10 pt-8 border-t border-[#ede7de]">
          <div className="flex items-center justify-between mb-4">
            <p className="font-mono-code text-[11px] uppercase tracking-wider font-semibold text-[#747269]">
              Core Capabilities &amp; Commercial Services
            </p>
            <span className="text-xs text-[#747269] hidden sm:inline">
              Select a discipline to view focus
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {pillars.map((pillar) => {
              const isSelected = activePillar === pillar.id;
              return (
                <button
                  key={pillar.id}
                  type="button"
                  onClick={() => setActivePillar(isSelected ? 'all' : pillar.id)}
                  className={`group relative text-left rounded-lg p-4 transition-all duration-200 border cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6] ${
                    isSelected
                      ? pillar.activeClass
                      : 'border-[#dfdbd2] bg-[#fdfcf9] hover:bg-[#f5f1ea] hover:border-[#c2bcb0]'
                  }`}
                  aria-pressed={isSelected}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono-code text-[10px] font-semibold tracking-wider uppercase text-[#747269]">
                      {pillar.tag}
                    </span>
                    <span
                      className={`h-2 w-2 rounded-full transition-transform duration-150 ${
                        isSelected ? 'scale-125 bg-current' : 'bg-[#c2bcb0] group-hover:scale-110'
                      }`}
                    />
                  </div>
                  <h2 className="text-sm sm:text-base font-semibold text-[#161614] mb-1">
                    {pillar.label}
                  </h2>
                  <p className="text-xs text-[#58564e] leading-normal">
                    {pillar.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Call to Actions & Verified Trust Signals */}
        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
          <a
            href="#showcase"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-[#161614] px-6 py-3.5 text-sm font-semibold text-[#fbf9f5] shadow-sm transition-all duration-150 hover:bg-[#2b2b27] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fbf9f5]"
          >
            <span>Explore Flagship Work</span>
            <ArrowDown className="h-4 w-4 transition-transform duration-150 group-hover:translate-y-0.5" />
          </a>

          <a
            href="#contact"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-[#c2bcb0] bg-[#fbf9f5] px-6 py-3.5 text-sm font-semibold text-[#161614] shadow-2xs transition-all duration-150 hover:border-[#161614] hover:bg-[#f2eee7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fbf9f5]"
          >
            <span>Discuss a Project</span>
            <ArrowUpRight className="h-4 w-4 text-[#747269]" />
          </a>

          <div className="sm:ml-auto flex items-center gap-2 text-xs font-mono-code text-[#747269]">
            <CheckCircle2 className="h-4 w-4 text-[#10b981]" />
            <span>Verified GitHub Codebase Available</span>
          </div>
        </div>

        {/* Engineering Badges / Proof Strip */}
        <div className="mt-12 pt-6 border-t border-[#ede7de] grid grid-cols-2 gap-4 sm:grid-cols-4 text-xs font-mono-code text-[#58564e]">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#b84218]" />
            <span>WordPress 6.7+ FSE</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#3b82f6]" />
            <span>Next.js 16 Active LTS</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]" />
            <span>TypeScript &amp; Clean Code</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#747269]" />
            <span>WCAG 2.2 AA Baseline</span>
          </div>
        </div>
      </div>
    </section>
  );
}
