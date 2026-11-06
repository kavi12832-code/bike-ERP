import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../../store';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';

export function PromoCarousel() {
  const navigate = useNavigate();
  const settings = useAppStore((state) => state.settings) || {};
  const promoSlides = settings.promoSlides || [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  // Auto-rotate every 6s, pause on hover, respect prefers-reduced-motion
  useEffect(() => {
    if (promoSlides.length <= 1) return;

    // Check media query for prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % promoSlides.length);
    }, 6000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [promoSlides.length, isPaused]);

  if (promoSlides.length === 0) return null;
  const currentSlide = promoSlides[currentIndex] || promoSlides[0];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % promoSlides.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + promoSlides.length) % promoSlides.length);
  };

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative rounded-[24px] overflow-hidden p-5 text-white shadow-card flex flex-col justify-between h-full transition-all bg-gradient-to-r from-navy-950 via-slate-900 to-blue-950 border border-white/20"
      role="region"
      aria-roledescription="carousel"
      aria-label="Festive promotional showcase"
    >
      {/* Dynamic Ambient Background Glow */}
      <div className="absolute inset-0 bg-radial-gradient from-blue-500/20 via-transparent to-transparent opacity-50 pointer-events-none" />

      {/* Slide Top Metadata */}
      <div className="relative z-10 flex items-center justify-between">
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-200 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-amber-300" />
          <span>{currentSlide.badge || 'Showroom Spotlight'}</span>
        </span>

        {/* Carousel Prev/Next Controls */}
        {promoSlides.length > 1 && (
          <div className="flex items-center gap-1 bg-black/30 backdrop-blur-xs rounded-lg p-0.5">
            <button
              onClick={handlePrev}
              className="p-1 rounded text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Previous promotional slide"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleNext}
              className="p-1 rounded text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Next promotional slide"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Slide Content */}
      <div className="relative z-10 my-3">
        <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
          {currentSlide.headline}
        </h3>
        <p className="text-xs text-blue-100/80 mt-1 max-w-lg leading-relaxed">
          {currentSlide.subtitle}
        </p>
      </div>

      {/* Footer: Explore CTA & Indicator Dots */}
      <div className="relative z-10 flex items-center justify-between pt-2 border-t border-white/10">
        <button
          onClick={() => navigate(currentSlide.ctaLink || '/showroom')}
          className="text-xs font-bold px-4 py-1.5 rounded-lg bg-white text-navy-950 hover:bg-blue-50 transition-all flex items-center gap-1.5 shadow-soft group"
        >
          <span>{currentSlide.ctaText || 'Explore Now'}</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Indicator Dots */}
        {promoSlides.length > 1 && (
          <div className="flex items-center gap-1.5">
            {promoSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PromoCarousel;

