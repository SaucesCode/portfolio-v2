'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, CheckCircle2, Mail, MapPin, Send } from 'lucide-react';

function GitHubIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

export function Footer() {
  const steps = [
    {
      num: '01',
      title: 'Architectural Discovery',
      desc: 'We define the technical scope, business objectives, performance targets, and content model before writing code.',
    },
    {
      num: '02',
      title: 'Design Systems & Tokens',
      desc: 'Crafting bespoke typography hierarchies, fluid scaling, theme.json tokens, and responsive layout foundations.',
    },
    {
      num: '03',
      title: 'Clean Engineering',
      desc: 'Developing on WordPress 6.7+ FSE or Next.js 16 with pure TypeScript, semantic HTML, and zero unnecessary dependencies.',
    },
    {
      num: '04',
      title: 'Audit & Launch',
      desc: 'Cross-browser testing, accessibility validation (WCAG 2.2 AA), SEO optimization, and clean deployment.',
    },
  ];

  return (
    <footer id="contact" className="border-t border-[#ede7de] bg-[#161614] text-[#fbf9f5]">
      {/* 4-Stage Process Section */}
      <div id="process" className="border-b border-[#2b2b27] py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <span className="font-mono-code text-xs font-semibold uppercase tracking-wider text-[#b84218]">
              Methodology
            </span>
            <h2 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-normal tracking-tight text-[#fbf9f5]">
              A disciplined, transparent development process.
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#9da7b8]">
              No ambiguous handoffs or bloated project cycles. You get structured milestones and direct access to the engineer building your system.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div
                key={step.num}
                className="rounded-lg border border-[#2b2b27] bg-[#1e1e1b] p-6 transition-colors hover:border-[#b84218]"
              >
                <div className="font-mono-code text-xs font-bold text-[#b84218] mb-3">
                  STAGE // {step.num}
                </div>
                <h3 className="text-base font-semibold text-[#fbf9f5] mb-2">
                  {step.title}
                </h3>
                <p className="text-xs text-[#9da7b8] leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Contact & Inquiry Bay */}
      <div className="py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
            {/* Left Column: Heading and Value Proposition */}
            <div className="lg:col-span-7">
              <span className="font-mono-code text-xs font-semibold uppercase tracking-wider text-[#10b981] flex items-center gap-1.5 mb-3">
                <span className="h-2 w-2 rounded-full bg-[#10b981]" />
                Accepting New Inquiries
              </span>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-[#fbf9f5] leading-tight">
                Ready to elevate your digital presence with{' '}
                <span className="font-serif-editorial italic text-[#b84218]">bespoke engineering</span>?
              </h2>

              <p className="mt-4 max-w-xl text-sm sm:text-base text-[#9da7b8] leading-relaxed">
                Whether you need a custom WordPress block theme built for your editorial brand, a high-performing web application, or a complete digital redesign, let’s discuss your specifications.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <a
                  href="https://github.com/SaucesCode"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-[#b84218] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#9a3412] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6]"
                >
                  <GitHubIcon className="h-4 w-4" />
                  <span>Connect on GitHub</span>
                  <ArrowUpRight className="h-4 w-4 opacity-80" />
                </a>

                <div className="flex items-center gap-2 text-xs font-mono-code text-[#9da7b8] sm:px-2">
                  <MapPin className="h-4 w-4 text-[#e5c07b]" />
                  <span>Manila, PH (UTC+8) • Serving Global Clients</span>
                </div>
              </div>
            </div>

            {/* Right Column: Direct Contract & Technical Specification Card */}
            <div className="lg:col-span-5">
              <div className="rounded-xl border border-[#2b2b27] bg-[#1e1e1b] p-6 sm:p-8">
                <h3 className="font-mono-code text-xs font-semibold uppercase tracking-wider text-[#e5c07b] mb-2">
                  Direct Inquiries &amp; Collaboration
                </h3>
                <p className="text-xs text-[#9da7b8] mb-6 leading-relaxed">
                  To ensure quality, I only accept 1-2 concurrent client projects at a time.
                </p>

                <div className="space-y-4 text-xs font-mono-code">
                  <div className="flex items-start justify-between border-b border-[#2b2b27] pb-3">
                    <span className="text-[#9da7b8]">Developer:</span>
                    <span className="text-[#fbf9f5] font-semibold text-right">James Patrick De Mesa</span>
                  </div>
                  <div className="flex items-start justify-between border-b border-[#2b2b27] pb-3">
                    <span className="text-[#9da7b8]">GitHub Profile:</span>
                    <a
                      href="https://github.com/SaucesCode"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#3b82f6] hover:underline flex items-center gap-1"
                    >
                      <span>github.com/SaucesCode</span>
                      <ArrowUpRight className="h-3 w-3" />
                    </a>
                  </div>
                  <div className="flex items-start justify-between border-b border-[#2b2b27] pb-3">
                    <span className="text-[#9da7b8]">Current Focus:</span>
                    <span className="text-[#10b981] text-right font-medium">WordPress FSE &amp; Next.js 16</span>
                  </div>
                  <div className="flex items-start justify-between">
                    <span className="text-[#9da7b8]">Availability:</span>
                    <span className="text-[#fbf9f5] text-right">Select Q2 2026 Engagements</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#2b2b27]">
                  <a
                    href="https://github.com/SaucesCode"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-[#3b82f6] bg-[#3b82f6]/10 py-2.5 text-xs font-semibold text-[#60a5fa] transition-colors hover:bg-[#3b82f6]/20"
                  >
                    <span>Send Message or Project Brief via GitHub</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Copyright & Ethical Standards Strip */}
          <div className="mt-16 pt-8 border-t border-[#2b2b27] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#747269]">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
              <span>&copy; {new Date().getFullYear()} James Patrick De Mesa. All rights reserved.</span>
              <span className="hidden sm:inline">•</span>
              <span className="font-mono-code text-[11px]">
                Built with Next.js 16 Active LTS &amp; React 19
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono-code">
              <a
                href="#top"
                className="hover:text-[#fbf9f5] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#3b82f6]"
              >
                Back to Top ↑
              </a>
            </div>
          </div>

          {/* Ethical Disclaimer */}
          <div className="mt-4 text-[10px] text-[#58564e] leading-normal">
            Notice: All project capabilities and repository links reference authentic source code hosted on GitHub.
            No artificial metrics, unverified testimonials, or fabricated scores are used on this portfolio.
          </div>
        </div>
      </div>
    </footer>
  );
}
