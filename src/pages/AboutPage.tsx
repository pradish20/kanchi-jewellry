import React from 'react';
import { Award, ShieldCheck, Sparkles, Gem, Clock } from 'lucide-react';

interface AboutPageProps {
  navigate: (route: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ navigate }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20">
      {/* Hero / Header */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-[11px] uppercase tracking-[0.28em] text-[#8C6D17] font-medium block mb-3">
          Heritage & Lineage
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl text-[#111111] font-normal tracking-tight mb-4">
          The Art of Kanchi Jewelry
        </h1>
        <p className="text-xs sm:text-sm text-[#666666] leading-relaxed font-light">
          Rooted in the eternal city of thousand temples, celebrating centuries of South Indian goldsmithing with contemporary poise.
        </p>
      </div>

      {/* Featured Editorial Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 aspect-4/3 bg-[#F5F3EC] border border-[#E8E4DA] overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=1200&q=80"
            alt="Artisans sculpting fine 22K gold jewellery"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="lg:col-span-6 space-y-6">
          <span className="text-[11px] uppercase tracking-[0.2em] text-[#8C6D17] font-medium block">
            Chapter 01
          </span>
          <h2 className="font-serif text-3xl text-[#111111] font-normal leading-tight">
            Our Story
          </h2>
          <p className="text-xs sm:text-sm text-[#555555] leading-relaxed font-light">
            Founded amidst the silk looms and temple spires of Kanchipuram, Kanchi Jewelry was born from a singular conviction: fine jewellery is not merely an ornament, but an enduring heirloom of sacred beauty.
          </p>
          <p className="text-xs sm:text-sm text-[#555555] leading-relaxed font-light">
            Our master goldsmiths inherit ancient temple repoussé, nakashi engraving, and polki stone setting traditions, elevating them into refined modern forms for celebrations that echo through time.
          </p>
          <div className="pt-2">
            <span className="text-[11px] text-[#888888] italic block">
              [EDITABLE STORY HIGHLIGHT PLACEHOLDER: Enter custom founding details or atelier archives here]
            </span>
          </div>
        </div>
      </div>

      {/* Craftsmanship Section */}
      <div className="bg-[#FAF9F5] border border-[#E8E4DA] p-8 sm:p-14">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <span className="text-[11px] uppercase tracking-[0.2em] text-[#8C6D17] font-medium block mb-2">
            Uncompromising Standards
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#111111]">
            Our Craft
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-6 bg-white border border-[#E8E4DA]">
            <div className="w-12 h-12 rounded-full border border-[#C5A059]/40 flex items-center justify-center mx-auto mb-4">
              <Award className="w-5 h-5 text-[#C5A059]" />
            </div>
            <h3 className="font-serif text-lg text-[#111111] mb-2">22K 916 BIS Hallmarking</h3>
            <p className="text-xs text-[#666666] leading-relaxed font-light">
              Every gram of gold is certified with the Bureau of Indian Standards HUID stamp, ensuring absolute purity and lifetime trust.
            </p>
          </div>

          <div className="p-6 bg-white border border-[#E8E4DA]">
            <div className="w-12 h-12 rounded-full border border-[#C5A059]/40 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-5 h-5 text-[#C5A059]" />
            </div>
            <h3 className="font-serif text-lg text-[#111111] mb-2">Uncut Polki & Rare Gems</h3>
            <p className="text-xs text-[#666666] leading-relaxed font-light">
              We hand-select natural uncut diamonds, untreated rubies, and Colombian emeralds, bezel-setting each with master precision.
            </p>
          </div>

          <div className="p-6 bg-white border border-[#E8E4DA]">
            <div className="w-12 h-12 rounded-full border border-[#C5A059]/40 flex items-center justify-center mx-auto mb-4">
              <Gem className="w-5 h-5 text-[#C5A059]" />
            </div>
            <h3 className="font-serif text-lg text-[#111111] mb-2">Temple Hand-Filigree</h3>
            <p className="text-xs text-[#666666] leading-relaxed font-light">
              Sculpted by generational artisans using delicate gold wirework and micro-repoussé that cannot be replicated by automated machines.
            </p>
          </div>
        </div>
      </div>

      {/* Philosophy Section */}
      <div className="max-w-3xl mx-auto text-center space-y-6">
        <span className="text-[11px] uppercase tracking-[0.2em] text-[#8C6D17] font-medium block">
          Our Philosophy
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl text-[#111111]">
          "Jewellery Crafted for Generations"
        </h2>
        <p className="text-xs sm:text-sm text-[#555555] leading-relaxed font-light">
          We believe true luxury is quiet, authentic, and lasting. We do not participate in fleeting fashion cycles. Instead, we create timeless ornaments that mothers pass to daughters with profound joy and pride.
        </p>
        <div className="pt-4">
          <button
            onClick={() => navigate('/jewelry')}
            className="px-8 py-3 bg-[#111111] text-[#FAF9F5] text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#8C6D17] transition-colors"
          >
            Explore the Collection
          </button>
        </div>
      </div>
    </div>
  );
};
