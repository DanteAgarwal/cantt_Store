'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  {
    id: 1,
    title: 'Gear Up. Stand Proud.',
    subtitle: 'Premium military & tactical merchandise for the brave.',
    ctaText: 'Shop Now',
    ctaHref: '/shop',
    secondaryText: 'View New Arrivals',
    secondaryHref: '/shop?sort=newest',
    bg: 'from-charcoal via-olive-dark to-background',
    badge: 'New Season',
  },
  {
    id: 2,
    title: 'Winter Collection 2025',
    subtitle: 'Tactical jackets, thermal wear & regimental sweaters — built for the cold.',
    ctaText: 'Explore Winter Wear',
    ctaHref: '/category/army-winter-wear',
    secondaryText: 'Shop Thermal Wear',
    secondaryHref: '/category/thermal-inner-wear',
    bg: 'from-background via-surface to-charcoal',
    badge: 'Season Arrival',
  },
  {
    id: 3,
    title: 'Survival Ops Collection',
    subtitle: 'Purpose-built tactical gear for field operations and outdoor survivalists.',
    ctaText: 'Explore Collection',
    ctaHref: '/shop?tag=survival-ops',
    secondaryText: 'View Tactical Gear',
    secondaryHref: '/category/tactical-gear',
    bg: 'from-olive-dark via-charcoal to-background',
    badge: 'Featured',
  },
];

export function HeroSection() {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => (c === 0 ? slides.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === slides.length - 1 ? 0 : c + 1));
  const slide = slides[current];

  return (
    <div className={`relative min-h-[420px] md:min-h-[520px] bg-gradient-to-br ${slide.bg} overflow-hidden`}>
      {/* Camo pattern overlay */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: 'repeating-linear-gradient(45deg, #4A6741 0, #4A6741 1px, transparent 0, transparent 50%)',
        backgroundSize: '20px 20px'
      }} />

      {/* Grid decoration */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(#C9A227 1px, transparent 1px), linear-gradient(90deg, #C9A227 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />

      <div className="container-main relative z-10 flex flex-col justify-center min-h-[420px] md:min-h-[520px] py-12">
        <div className="max-w-2xl animate-fade-in" key={current}>
          {/* Badge */}
          <span className="badge badge-accent mb-4 inline-block text-xs tracking-widest uppercase">
            {slide.badge}
          </span>

          {/* Heading */}
          <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-4 leading-tight">
            {slide.title.split(' ').slice(0, -1).join(' ')}{' '}
            <span className="gold-shimmer">{slide.title.split(' ').slice(-1)}</span>
          </h1>

          {/* Subtitle */}
          <p className="text-muted text-lg md:text-xl mb-8 max-w-lg text-balance">
            {slide.subtitle}
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4">
            <Link href={slide.ctaHref} className="btn-primary text-base px-8 py-3.5">
              {slide.ctaText}
            </Link>
            <Link href={slide.secondaryHref} className="btn-outline text-base px-8 py-3.5">
              {slide.secondaryText}
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-surface/80 border border-border hover:border-accent hover:text-accent text-muted flex items-center justify-center transition-all"
        aria-label="Previous slide"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-surface/80 border border-border hover:border-accent hover:text-accent text-muted flex items-center justify-center transition-all"
        aria-label="Next slide"
      >
        <ChevronRight size={20} />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`rounded-full transition-all duration-300 ${i === current ? 'bg-accent w-6 h-2' : 'bg-muted/40 w-2 h-2 hover:bg-muted'}`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Slide counter */}
      <span className="absolute bottom-6 right-6 text-muted text-xs font-mono z-20">
        {String(current + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
      </span>
    </div>
  );
}
