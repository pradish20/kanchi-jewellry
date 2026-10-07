import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Instagram,
  Facebook,
  MessageSquare,
  ExternalLink,
  Send,
  CheckCircle2,
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export const ContactPage: React.FC = () => {
  const { settings } = useSettings();
  const info = settings.brand_info;

  const [formState, setFormState] = useState({
    name: '',
    email: '',
    phone: '',
    service: 'Bridal Concierge Consultation',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormState({
        name: '',
        email: '',
        phone: '',
        service: 'Bridal Concierge Consultation',
        message: '',
      });
    }, 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Editorial Header */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-[11px] uppercase tracking-[0.28em] text-[#8C6D17] font-medium block mb-3">
          Concierge & Atelier
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl text-[#111111] font-normal tracking-tight mb-4">
          Connect with Kanchi Jewelry
        </h1>
        <p className="text-xs sm:text-sm text-[#666666] leading-relaxed font-light">
          Whether inquiring about a bespoke bridal commission, purity certification, or visiting our Kanchipuram vault, our concierge is at your service.
        </p>
      </div>

      {/* Main Grid: Contact Cards Left, Inquiry Form Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Contact Info Cards */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Physical Address */}
          <div className="p-6 bg-white border border-[#E8E4DA] space-y-3">
            <div className="flex items-center gap-3 text-[#111111]">
              <div className="w-9 h-9 rounded-full bg-[#FAF9F5] border border-[#E8E4DA] flex items-center justify-center">
                <MapPin className="w-4 h-4 text-[#8C6D17]" />
              </div>
              <h3 className="font-serif text-lg font-medium">Atelier & Showroom</h3>
            </div>
            <p className="text-xs text-[#555555] font-light leading-relaxed">
              {info.address || 'ADDRESS_HERE'}
            </p>
            <a
              href={info.google_maps.startsWith('http') ? info.google_maps : '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-[#8C6D17] hover:underline font-medium pt-1"
            >
              <span>View on Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Direct Communication */}
          <div className="p-6 bg-white border border-[#E8E4DA] space-y-4">
            <h3 className="font-serif text-lg text-[#111111] font-medium">Direct Inquiries</h3>
            
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#8C6D17] shrink-0" />
                <div>
                  <span className="text-[#888888] block text-[10px] uppercase tracking-wider">Phone</span>
                  <a href={`tel:${info.phone}`} className="text-[#111111] hover:text-[#8C6D17] font-medium">
                    {info.phone || 'PHONE_NUMBER_HERE'}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#8C6D17] shrink-0" />
                <div>
                  <span className="text-[#888888] block text-[10px] uppercase tracking-wider">Email</span>
                  <a href={`mailto:${info.email}`} className="text-[#111111] hover:text-[#8C6D17] font-medium">
                    {info.email || 'EMAIL_HERE'}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4 text-[#8C6D17] shrink-0" />
                <div>
                  <span className="text-[#888888] block text-[10px] uppercase tracking-wider">WhatsApp Concierge</span>
                  <a
                    href={`https://wa.me/${info.whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#111111] hover:text-[#8C6D17] font-medium"
                  >
                    {info.whatsapp || 'WHATSAPP_NUMBER_HERE'}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Social Channels */}
          <div className="p-6 bg-white border border-[#E8E4DA] space-y-4">
            <h3 className="font-serif text-lg text-[#111111] font-medium">Social Chronicles</h3>
            <div className="flex gap-4">
              <a
                href={info.instagram.startsWith('http') ? info.instagram : '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 border border-[#E8E4DA] text-xs text-[#333333] hover:border-[#111111] transition-colors"
              >
                <Instagram className="w-4 h-4 text-[#8C6D17]" />
                <span>Instagram: INSTAGRAM_URL_HERE</span>
              </a>
              <a
                href={info.facebook.startsWith('http') ? info.facebook : '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 border border-[#E8E4DA] text-xs text-[#333333] hover:border-[#111111] transition-colors"
              >
                <Facebook className="w-4 h-4 text-[#8C6D17]" />
                <span>Facebook: FACEBOOK_URL_HERE</span>
              </a>
            </div>
          </div>

          {/* Atelier Hours */}
          <div className="p-6 bg-[#FAF9F5] border border-[#E8E4DA] space-y-2 text-xs">
            <div className="flex items-center gap-2 text-[#111111] font-medium uppercase tracking-wider text-[11px]">
              <Clock className="w-4 h-4 text-[#8C6D17]" />
              <span>Visiting Hours</span>
            </div>
            <p className="text-[#555555] font-light leading-relaxed">
              {info.business_hours || 'BUSINESS_HOURS'}
            </p>
          </div>

        </div>

        {/* Bespoke Inquiry Form Right */}
        <div className="lg:col-span-7 bg-white border border-[#E8E4DA] p-8 sm:p-10 shadow-sm">
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#8C6D17] font-medium block mb-2">
            Private Consultation
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#111111] mb-2">
            Send an Atelier Inquiry
          </h2>
          <p className="text-xs text-[#666666] mb-8 font-light leading-relaxed">
            Please share your requirements for bridal sets, customized polki sizing, or hallmarking questions. A dedicated concierge will respond within 24 business hours.
          </p>

          {submitted ? (
            <div className="p-8 bg-emerald-50 border border-emerald-200 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-800 mx-auto" />
              <h3 className="font-serif text-xl text-emerald-950 font-medium">Inquiry Received</h3>
              <p className="text-xs text-emerald-800 max-w-sm mx-auto">
                Thank you for contacting Kanchi Jewelry. Our master concierge will review your message and connect with you shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#777777] mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    placeholder="Full name"
                    className="w-full bg-[#FAF9F5] border border-[#D6CEBE] text-xs px-3 py-2.5 text-[#111111] focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#777777] mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formState.phone}
                    onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                    placeholder="10-digit mobile number"
                    className="w-full bg-[#FAF9F5] border border-[#D6CEBE] text-xs px-3 py-2.5 text-[#111111] focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#777777] mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formState.email}
                  onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full bg-[#FAF9F5] border border-[#D6CEBE] text-xs px-3 py-2.5 text-[#111111] focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#777777] mb-1">
                  Inquiry Nature
                </label>
                <select
                  value={formState.service}
                  onChange={(e) => setFormState({ ...formState, service: e.target.value })}
                  className="w-full bg-[#FAF9F5] border border-[#D6CEBE] text-xs px-3 py-2.5 text-[#111111] focus:outline-none focus:border-[#C5A059]"
                >
                  <option value="Bridal Concierge Consultation">Bridal Concierge Consultation</option>
                  <option value="Custom Heirloom Commission">Custom Heirloom Commission</option>
                  <option value="Product Sizing & Stone Details">Product Sizing & Stone Details</option>
                  <option value="Order Status & Delivery Logistics">Order Status & Delivery Logistics</option>
                  <option value="General Brand Inquiry">General Brand Inquiry</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#777777] mb-1">
                  Message *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formState.message}
                  onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                  placeholder="Tell us about the piece you are admiring or your custom vision..."
                  className="w-full bg-[#FAF9F5] border border-[#D6CEBE] text-xs px-3 py-2.5 text-[#111111] focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#111111] text-[#FAF9F5] text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#8C6D17] transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Submit Inquiry to Concierge</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
