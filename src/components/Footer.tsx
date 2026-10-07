import React from 'react';
import { Instagram, Facebook, Phone, Mail, MapPin, MessageSquare, ShieldCheck, Award, Sparkles } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

interface FooterProps {
  navigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  const { settings } = useSettings();
  const info = settings.brand_info;

  return (
    <footer className="bg-[#111111] text-[#FAF9F5] border-t border-[#262626] pt-16 pb-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Heritage Trust Badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12 border-b border-[#262626] text-center md:text-left">
          <div className="flex items-center gap-4 justify-center md:justify-start">
            <div className="w-10 h-10 rounded-full border border-[#C5A059]/40 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5 text-[#C5A059]" />
            </div>
            <div>
              <h4 className="font-serif text-base tracking-wider text-[#FAF9F5]">BIS Hallmarked Purity</h4>
              <p className="text-xs text-[#888888] mt-0.5">Certified 22K 916 gold with laser inscribed HUID stamp</p>
            </div>
          </div>

          <div className="flex items-center gap-4 justify-center md:justify-start">
            <div className="w-10 h-10 rounded-full border border-[#C5A059]/40 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-[#C5A059]" />
            </div>
            <div>
              <h4 className="font-serif text-base tracking-wider text-[#FAF9F5]">Natural Certified Gemstones</h4>
              <p className="text-xs text-[#888888] mt-0.5">Uncut Polki diamonds, Burmese rubies & Colombian emeralds</p>
            </div>
          </div>

          <div className="flex items-center gap-4 justify-center md:justify-start">
            <div className="w-10 h-10 rounded-full border border-[#C5A059]/40 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-[#C5A059]" />
            </div>
            <div>
              <h4 className="font-serif text-base tracking-wider text-[#FAF9F5]">Insured Armed Transit</h4>
              <p className="text-xs text-[#888888] mt-0.5">Discreet tamper-proof packaging with full insurance</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links & Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 py-12 border-b border-[#262626]">
          
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <span className="font-serif text-2xl font-medium tracking-[0.2em] text-[#FAF9F5] block mb-4">
              KANCHI JEWELRY
            </span>
            <p className="text-xs text-[#999999] leading-relaxed max-w-sm font-light">
              Rooted in the eternal temple aesthetics of Kanchipuram, our artisans handcraft royal Indian jewellery 
              that transcends generations. Each creation is an embodiment of devotion, precision, and timeless elegance.
            </p>
            
            <div className="flex items-center gap-3 mt-6">
              <a
                href={info.instagram.startsWith('http') ? info.instagram : '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full border border-[#333333] hover:border-[#C5A059] hover:text-[#C5A059] flex items-center justify-center text-[#888888] transition-colors"
                title="Instagram: [INSTAGRAM LINK]"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={info.facebook.startsWith('http') ? info.facebook : '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full border border-[#333333] hover:border-[#C5A059] hover:text-[#C5A059] flex items-center justify-center text-[#888888] transition-colors"
                title="Facebook: [FACEBOOK LINK]"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={info.whatsapp.startsWith('http') ? info.whatsapp : `https://wa.me/${info.whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full border border-[#333333] hover:border-[#C5A059] hover:text-[#C5A059] flex items-center justify-center text-[#888888] transition-colors"
                title="WhatsApp: [WHATSAPP]"
              >
                <MessageSquare className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] font-medium text-[#C5A059] mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-xs text-[#A0A0A0]">
              <li>
                <button onClick={() => navigate('/')} className="hover:text-[#FAF9F5] transition-colors">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/jewelry')} className="hover:text-[#FAF9F5] transition-colors">
                  Jewelry
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/new-items')} className="hover:text-[#FAF9F5] transition-colors">
                  New Items
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/about')} className="hover:text-[#FAF9F5] transition-colors">
                  About
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/contact')} className="hover:text-[#FAF9F5] transition-colors">
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Jewelry Categories */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] font-medium text-[#C5A059] mb-4">
              Fine Jewelry
            </h4>
            <ul className="space-y-2.5 text-xs text-[#A0A0A0]">
              <li>
                <button onClick={() => navigate('/jewelry/rings')} className="hover:text-[#FAF9F5] transition-colors">
                  Rings
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/jewelry/chains')} className="hover:text-[#FAF9F5] transition-colors">
                  Chains
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/jewelry/bracelets')} className="hover:text-[#FAF9F5] transition-colors">
                  Bracelets
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/jewelry/necklaces')} className="hover:text-[#FAF9F5] transition-colors">
                  Necklaces
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/jewelry')} className="hover:text-[#FAF9F5] transition-colors">
                  Bridal Sets
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details (With editable placeholders) */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] font-medium text-[#C5A059] mb-4">
              Concierge
            </h4>
            <div className="space-y-3 text-xs text-[#A0A0A0]">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-3.5 h-3.5 text-[#C5A059] shrink-0 mt-0.5" />
                <span className="font-light">{info.address || '[ADDRESS]'}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
                <span className="font-light">{info.phone || '[PHONE NUMBER]'}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
                <span className="font-light">{info.email || '[EMAIL ADDRESS]'}</span>
              </div>
              <div className="pt-2 border-t border-[#222222] text-[11px] text-[#777777]">
                <div className="font-medium text-[#999999] mb-0.5">Hours:</div>
                <div>{info.business_hours || '[BUSINESS HOURS]'}</div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Copyright & Legal */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#666666]">
          <p>© {new Date().getFullYear()} KANCHI JEWELRY. All rights reserved.</p>
          <div className="flex items-center gap-6 mt-4 sm:mt-0">
            <span className="hover:text-[#999999] transition-colors cursor-pointer">Privacy Policy</span>
            <span className="hover:text-[#999999] transition-colors cursor-pointer">Terms of Service</span>
            <span className="hover:text-[#999999] transition-colors cursor-pointer">Hallmark Purity Verification</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
