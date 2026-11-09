'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, Check, Code, Layout, ShoppingBag, ShieldCheck, Zap } from 'lucide-react';

export function ServicesSection() {
  const services = [
    {
      id: 'wordpress',
      title: 'Custom WordPress & FSE Block Themes',
      subtitle: 'Editorial Craft & Native Gutenberg Architecture',
      icon: Layout,
      color: '#b84218',
      summary:
        'Modern WordPress themes built cleanly on WordPress 6.7+ Full Site Editing and theme.json design tokens. No heavyweight visual builders (Elementor/Divi), no plugin bloat, and no recurring license dependencies.',
      deliverables: [
        'Bespoke theme.json design token systems',
        'Native Gutenberg block patterns for editorial teams',
        'Sub-second page speeds with pure semantic HTML',
        'Fluid typography scaling from mobile to ultra-wide',
        'Clean PHP 8.3 template architecture',
      ],
      idealFor: 'Boutique brands, publishing houses, agencies, and businesses tired of fragile page builders.',
      tech: ['WordPress 6.7+', 'PHP 8.3', 'Full Site Editing', 'theme.json', 'CSS Custom Props'],
    },
    {
      id: 'fullstack',
      title: 'Full-Stack Web Applications & Systems',
      subtitle: 'Next.js 16 Active LTS & Cloud Architecture',
      icon: Code,
      color: '#3b82f6',
      summary:
        'Custom web applications engineered from the ground up for stability, security, and scale. From internal business tools to customer-facing SaaS dashboards, built with strict TypeScript and modern Next.js server components.',
      deliverables: [
        'Next.js 16 App Router & Server Components',
        'End-to-end TypeScript with Zod runtime validation',
        'Postgres database modeling & Prisma/Drizzle ORM',
        'Automated CI/CD workflows & Playwright test suites',
        'Enterprise security headers & OWASP compliance',
      ],
      idealFor: 'Startups, scaling companies, and organizations needing bespoke software beyond standard CMS tools.',
      tech: ['Next.js 16 LTS', 'React 19', 'TypeScript', 'Tailwind CSS', 'Playwright'],
    },
    {
      id: 'ecommerce',
      title: 'High-Converting Landing & E-Commerce',
      subtitle: 'Performance-First Storefronts & Campaigns',
      icon: ShoppingBag,
      color: '#10b981',
      summary:
        'Art-directed commerce experiences that blend luxury editorial visuals with conversion-driven usability. Built to load fast on real mobile networks, reducing bounce rates and maximizing sales.',
      deliverables: [
        'Custom WooCommerce or headless commerce solutions',
        'High-converting product lookbooks & story-led PDPs',
        'Instant mobile interaction & zero layout shift (CLS)',
        'Stripe & PayPal frictionless checkout flows',
        'Comprehensive technical SEO & OpenGraph markup',
      ],
      idealFor: 'DTC apparel brands, luxury products, high-ticket consultants, and product launches.',
      tech: ['WooCommerce / Shopify', 'Stripe API', 'Semantic HTML5', 'Schema.org JSON-LD'],
    },
  ];

  return (
    <section id="services" className="border-b border-[#ede7de] bg-[#fbf9f5] py-16 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="h-2 w-2 rounded-full bg-[#161614]" />
            <span className="font-mono-code text-xs font-semibold uppercase tracking-wider text-[#747269]">
              Commercial Offerings
            </span>
          </div>
          
          <h2 className="text-3xl font-medium tracking-tight text-[#161614] sm:text-4xl lg:text-5xl leading-tight">
            Tailored engineering for businesses that refuse to settle for{' '}
            <span className="font-serif-editorial italic text-[#b84218]">generic templates</span>.
          </h2>
          
          <p className="mt-4 text-base sm:text-lg text-[#58564e] leading-relaxed">
            Every engagement is approached with architectural rigor, obsessive typography, and clean code.
            Choose the service track tailored to your current commercial challenge.
          </p>
        </div>

        {/* 3 Service Columns */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.id}
                className="group relative flex flex-col justify-between rounded-xl border border-[#dfdbd2] bg-[#fdfcf9] p-6 sm:p-8 shadow-xs transition-all duration-200 hover:border-[#161614] hover:shadow-md"
              >
                <div>
                  {/* Top Icon & Subtitle */}
                  <div className="flex items-center justify-between mb-4">
                    <div 
                      className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#dfdbd2] bg-[#f2eee7] transition-transform group-hover:scale-105"
                      style={{ color: service.color }}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-mono-code text-[11px] font-semibold uppercase tracking-wider text-[#747269]">
                      Pillar 0{services.indexOf(service) + 1}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-semibold text-[#161614] mb-1">
                    {service.title}
                  </h3>
                  <div className="font-serif-editorial italic text-sm text-[#747269] mb-4">
                    {service.subtitle}
                  </div>

                  <p className="text-xs sm:text-sm text-[#58564e] leading-relaxed mb-6">
                    {service.summary}
                  </p>

                  {/* Deliverables Checklist */}
                  <div className="border-t border-[#ede7de] pt-5 mb-6">
                    <h4 className="font-mono-code text-[11px] font-semibold uppercase tracking-wider text-[#161614] mb-3">
                      Included Deliverables
                    </h4>
                    <ul className="space-y-2.5">
                      {service.deliverables.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-[#58564e]">
                          <Check className="h-4 w-4 shrink-0 text-[#10b981] mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Footer of Card: Ideal For & Tech Tags */}
                <div>
                  <div className="border-t border-[#ede7de] pt-4 mb-4">
                    <div className="text-[11px] font-mono-code text-[#747269] mb-2">
                      <span className="font-semibold text-[#161614]">Ideal for:</span> {service.idealFor}
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {service.tech.map((t, idx) => (
                        <span
                          key={idx}
                          className="font-mono-code text-[10px] bg-[#f2eee7] border border-[#dfdbd2] text-[#58564e] rounded px-2 py-0.5"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <a
                    href="#contact"
                    className="mt-2 inline-flex w-full items-center justify-between rounded-md border border-[#c2bcb0] bg-white px-4 py-2.5 text-xs font-semibold text-[#161614] transition-all hover:bg-[#161614] hover:text-[#fbf9f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6]"
                  >
                    <span>Inquire About This Service</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quality Commitment Callout */}
        <div className="mt-12 rounded-xl border border-[#dfdbd2] bg-[#f2eee7] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#161614] text-[#fbf9f5]">
              <ShieldCheck className="h-5 w-5 text-[#10b981]" />
            </div>
            <div>
              <h4 className="text-base font-semibold text-[#161614]">
                Rigorous Engineering Standard &amp; Code Quality Guarantee
              </h4>
              <p className="text-xs sm:text-sm text-[#58564e] mt-1 max-w-2xl">
                Every client deliverable includes clean, commented code, zero unverified metrics, strict TypeScript typing,
                and WCAG 2.2 accessibility conformance.
              </p>
            </div>
          </div>

          <a
            href="https://github.com/SaucesCode"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-1.5 font-mono-code text-xs font-semibold text-[#161614] hover:text-[#b84218] transition-colors"
          >
            <span>Review Public GitHub Profile</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>

      </div>
    </section>
  );
}
