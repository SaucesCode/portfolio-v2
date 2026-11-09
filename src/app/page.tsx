import React from 'react';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { SplitRevealShowcase } from '@/components/SplitRevealShowcase';
import { ServicesSection } from '@/components/ServicesSection';
import { Footer } from '@/components/Footer';

export default function HomePage() {
  return (
    <div id="top" className="flex min-h-screen flex-col bg-[#fbf9f5] selection:bg-[#b84218] selection:text-[#fbf9f5]">
      {/* Accessible Skip Link for Keyboard Navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-[#161614] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[#fbf9f5] focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
      >
        Skip to main content
      </a>

      {/* Primary Sticky Header */}
      <Header />

      {/* Main Content Landmark */}
      <main id="main-content" className="flex-1">
        {/* Hero Section */}
        <Hero />

        {/* Dual-View Split Showcase (Interactive Flagship Project) */}
        <SplitRevealShowcase />

        {/* Commercial Services & Capabilities */}
        <ServicesSection />
      </main>

      {/* Process & Contact Footer */}
      <Footer />
    </div>
  );
}
