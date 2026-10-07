import React, { useState } from 'react';
import { Save, Check, Loader2 } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { settingsService } from '../services/settingsService';

export const AdminSettings: React.FC = () => {
  const { settings, refreshSettings } = useSettings();
  const [brandInfo, setBrandInfo] = useState({ ...settings.brand_info });
  const [shippingSettings, setShippingSettings] = useState({ ...settings.shipping_settings });
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await Promise.all([
        settingsService.updateBrandInfo(brandInfo),
        settingsService.updateShippingSettings(shippingSettings),
      ]);
      await refreshSettings();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(`Save error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl text-[#111111]">
          Website & Business Settings
        </h1>
        <p className="text-xs text-[#777777] mt-1">
          Update brand credentials, concierge contact information, and shipping thresholds stored in Supabase.
        </p>
      </div>

      <form onSubmit={handleSaveAll} className="space-y-8 text-xs">
        
        {/* Brand & Concierge Details */}
        <div className="bg-white border border-[#E8E4DA] p-6 space-y-4">
          <h2 className="font-serif text-lg text-[#111111] pb-3 border-b border-[#E8E4DA]">
            Brand Identity & Concierge Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block uppercase tracking-wider text-[11px] text-[#777777] mb-1">
                Brand Name
              </label>
              <input
                type="text"
                value={brandInfo.brand_name}
                onChange={(e) => setBrandInfo({ ...brandInfo, brand_name: e.target.value })}
                className="w-full bg-[#FAF9F5] border border-[#D6CEBE] px-3 py-2 text-xs text-[#111111]"
              />
            </div>

            <div>
              <label className="block uppercase tracking-wider text-[11px] text-[#777777] mb-1">
                Tagline
              </label>
              <input
                type="text"
                value={brandInfo.tagline}
                onChange={(e) => setBrandInfo({ ...brandInfo, tagline: e.target.value })}
                className="w-full bg-[#FAF9F5] border border-[#D6CEBE] px-3 py-2 text-xs text-[#111111]"
              />
            </div>

            <div>
              <label className="block uppercase tracking-wider text-[11px] text-[#777777] mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                value={brandInfo.phone}
                onChange={(e) => setBrandInfo({ ...brandInfo, phone: e.target.value })}
                placeholder="PHONE_NUMBER_HERE"
                className="w-full bg-[#FAF9F5] border border-[#D6CEBE] px-3 py-2 text-xs text-[#111111]"
              />
            </div>

            <div>
              <label className="block uppercase tracking-wider text-[11px] text-[#777777] mb-1">
                Contact Email
              </label>
              <input
                type="text"
                value={brandInfo.email}
                onChange={(e) => setBrandInfo({ ...brandInfo, email: e.target.value })}
                placeholder="EMAIL_HERE"
                className="w-full bg-[#FAF9F5] border border-[#D6CEBE] px-3 py-2 text-xs text-[#111111]"
              />
            </div>

            <div>
              <label className="block uppercase tracking-wider text-[11px] text-[#777777] mb-1">
                WhatsApp Number
              </label>
              <input
                type="text"
                value={brandInfo.whatsapp}
                onChange={(e) => setBrandInfo({ ...brandInfo, whatsapp: e.target.value })}
                placeholder="WHATSAPP_NUMBER_HERE"
                className="w-full bg-[#FAF9F5] border border-[#D6CEBE] px-3 py-2 text-xs text-[#111111]"
              />
            </div>

            <div>
              <label className="block uppercase tracking-wider text-[11px] text-[#777777] mb-1">
                Instagram URL
              </label>
              <input
                type="text"
                value={brandInfo.instagram}
                onChange={(e) => setBrandInfo({ ...brandInfo, instagram: e.target.value })}
                placeholder="INSTAGRAM_URL_HERE"
                className="w-full bg-[#FAF9F5] border border-[#D6CEBE] px-3 py-2 text-xs text-[#111111]"
              />
            </div>

            <div>
              <label className="block uppercase tracking-wider text-[11px] text-[#777777] mb-1">
                Facebook URL
              </label>
              <input
                type="text"
                value={brandInfo.facebook}
                onChange={(e) => setBrandInfo({ ...brandInfo, facebook: e.target.value })}
                placeholder="FACEBOOK_URL_HERE"
                className="w-full bg-[#FAF9F5] border border-[#D6CEBE] px-3 py-2 text-xs text-[#111111]"
              />
            </div>

            <div>
              <label className="block uppercase tracking-wider text-[11px] text-[#777777] mb-1">
                Google Maps Link
              </label>
              <input
                type="text"
                value={brandInfo.google_maps}
                onChange={(e) => setBrandInfo({ ...brandInfo, google_maps: e.target.value })}
                placeholder="GOOGLE_MAPS_URL_HERE"
                className="w-full bg-[#FAF9F5] border border-[#D6CEBE] px-3 py-2 text-xs text-[#111111]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block uppercase tracking-wider text-[11px] text-[#777777] mb-1">
                Physical Atelier Address
              </label>
              <input
                type="text"
                value={brandInfo.address}
                onChange={(e) => setBrandInfo({ ...brandInfo, address: e.target.value })}
                placeholder="ADDRESS_HERE"
                className="w-full bg-[#FAF9F5] border border-[#D6CEBE] px-3 py-2 text-xs text-[#111111]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block uppercase tracking-wider text-[11px] text-[#777777] mb-1">
                Visiting & Business Hours
              </label>
              <input
                type="text"
                value={brandInfo.business_hours}
                onChange={(e) => setBrandInfo({ ...brandInfo, business_hours: e.target.value })}
                placeholder="BUSINESS_HOURS"
                className="w-full bg-[#FAF9F5] border border-[#D6CEBE] px-3 py-2 text-xs text-[#111111]"
              />
            </div>
          </div>
        </div>

        {/* Shipping & Transit Rules */}
        <div className="bg-white border border-[#E8E4DA] p-6 space-y-4">
          <h2 className="font-serif text-lg text-[#111111] pb-3 border-b border-[#E8E4DA]">
            Shipping & Insured Transit Rules
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block uppercase tracking-wider text-[11px] text-[#777777] mb-1">
                Free Shipping Threshold (INR)
              </label>
              <input
                type="number"
                value={shippingSettings.free_shipping_threshold}
                onChange={(e) =>
                  setShippingSettings({
                    ...shippingSettings,
                    free_shipping_threshold: Number(e.target.value),
                  })
                }
                className="w-full bg-[#FAF9F5] border border-[#D6CEBE] px-3 py-2 text-xs text-[#111111]"
              />
            </div>

            <div>
              <label className="block uppercase tracking-wider text-[11px] text-[#777777] mb-1">
                Standard Shipping Fee (INR)
              </label>
              <input
                type="number"
                value={shippingSettings.standard_shipping_fee}
                onChange={(e) =>
                  setShippingSettings({
                    ...shippingSettings,
                    standard_shipping_fee: Number(e.target.value),
                  })
                }
                className="w-full bg-[#FAF9F5] border border-[#D6CEBE] px-3 py-2 text-xs text-[#111111]"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between pt-4">
          {savedSuccess && (
            <span className="text-emerald-800 flex items-center gap-1 font-medium text-xs">
              <Check className="w-4 h-4" /> Settings updated successfully in Supabase
            </span>
          )}
          <button
            type="submit"
            disabled={saving}
            className="ml-auto px-6 py-2.5 bg-[#111111] text-[#FAF9F5] text-xs uppercase tracking-wider font-medium hover:bg-[#8C6D17] transition-colors flex items-center gap-2 shadow-sm"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Settings to Supabase</span>
          </button>
        </div>

      </form>
    </div>
  );
};
