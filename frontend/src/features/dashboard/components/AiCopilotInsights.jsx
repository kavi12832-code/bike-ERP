import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Bot, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

export function AiCopilotInsights({ insights = [] }) {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-rotate every 8 seconds if multiple insights exist
  useEffect(() => {
    if (insights.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % insights.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [insights.length]);

  const currentInsight = insights[currentIndex] || insights[0];
  if (!currentInsight) return null;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % insights.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + insights.length) % insights.length);
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50/80 via-blue-50/40 to-surface rounded-2xl border border-indigo-200/60 p-5 shadow-xs flex flex-col justify-between relative overflow-hidden">
      {/* Decorative ambient backdrop */}
      <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 rounded-full bg-primary/5 blur-xl pointer-events-none" />

      {/* Header with Mascot & Smart Insights Badge */}
      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-soft shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-text-main flex items-center gap-1.5">
              <span>AI Copilot</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200/60 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-primary" />
                <span>Smart insights</span>
              </span>
            </h2>
            <p className="text-[10px] text-text-muted">Proactive intelligence from live store records</p>
          </div>
        </div>

        {/* Carousel controls if multiple */}
        {insights.length > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              className="p-1 rounded text-text-muted hover:text-text-main hover:bg-surface transition-colors"
              aria-label="Previous insight"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] text-text-muted font-mono">
              {currentIndex + 1}/{insights.length}
            </span>
            <button
              onClick={handleNext}
              className="p-1 rounded text-text-muted hover:text-text-main hover:bg-surface transition-colors"
              aria-label="Next insight"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Insight Body */}
      <div className="my-2 relative z-10">
        <div className="flex items-center gap-2 mb-1.5">
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
              currentInsight.badgeColor || 'bg-blue-100 text-blue-800'
            }`}
          >
            {currentInsight.badge}
          </span>
          <span className="text-[11px] font-medium text-text-muted">
            {currentInsight.category}
          </span>
        </div>

        <h3 className="text-sm font-bold text-text-main leading-snug">
          {currentInsight.headline}
        </h3>
        <p className="text-xs text-text-muted mt-1 leading-relaxed">
          {currentInsight.message}
        </p>
      </div>

      {/* Footer & CTA */}
      <div className="pt-3 border-t border-indigo-100/80 flex items-center justify-between relative z-10 mt-3">
        <span className="text-[10px] text-text-muted italic">
          Copilot suggests actions; managers make final decisions.
        </span>

        <button
          onClick={() => navigate(currentInsight.ctaLink || '/ai')}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-primary-dark transition-all shadow-xs flex items-center gap-1.5"
        >
          <span>{currentInsight.ctaLabel || 'View Insights'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default AiCopilotInsights;

