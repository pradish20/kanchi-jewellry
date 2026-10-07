import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { SiteSettings } from '../types/database';

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  brand_info: {
    brand_name: 'KANCHI JEWELRY',
    tagline: 'Timeless Jewellery. Endless Elegance.',
    phone: 'PHONE_NUMBER_HERE',
    email: 'EMAIL_HERE',
    address: 'ADDRESS_HERE',
    whatsapp: 'WHATSAPP_NUMBER_HERE',
    instagram: 'INSTAGRAM_URL_HERE',
    facebook: 'FACEBOOK_URL_HERE',
    google_maps: 'GOOGLE_MAPS_URL_HERE',
    business_hours: 'Monday - Saturday: 10:30 AM - 8:30 PM | Sunday: By Appointment',
    support_note: 'For bridal consultations and customized heirloom ornaments, contact our master craftsmen.',
  },
  shipping_settings: {
    free_shipping_threshold: 50000,
    standard_shipping_fee: 500,
    insured_courier: true,
    estimated_days: '3-5 Business Days with Insured Armed Courier',
  },
};

export const settingsService = {
  async getSettings(): Promise<SiteSettings> {
    if (!isSupabaseConfigured()) {
      return DEFAULT_SITE_SETTINGS;
    }

    try {
      const { data, error } = await supabase.from('site_settings').select('*');
      if (error || !data || data.length === 0) {
        return DEFAULT_SITE_SETTINGS;
      }

      const settingsMap: any = { ...DEFAULT_SITE_SETTINGS };
      for (const row of data) {
        if (row.key === 'brand_info') {
          settingsMap.brand_info = { ...DEFAULT_SITE_SETTINGS.brand_info, ...row.value };
        } else if (row.key === 'shipping_settings') {
          settingsMap.shipping_settings = { ...DEFAULT_SITE_SETTINGS.shipping_settings, ...row.value };
        }
      }

      return settingsMap;
    } catch {
      return DEFAULT_SITE_SETTINGS;
    }
  },

  async updateBrandInfo(brandInfo: Partial<SiteSettings['brand_info']>): Promise<void> {
    if (!isSupabaseConfigured()) return;

    const current = await this.getSettings();
    const updated = { ...current.brand_info, ...brandInfo };

    const { error } = await supabase
      .from('site_settings')
      .upsert({
        key: 'brand_info',
        value: updated,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;
  },

  async updateShippingSettings(shippingSettings: Partial<SiteSettings['shipping_settings']>): Promise<void> {
    if (!isSupabaseConfigured()) return;

    const current = await this.getSettings();
    const updated = { ...current.shipping_settings, ...shippingSettings };

    const { error } = await supabase
      .from('site_settings')
      .upsert({
        key: 'shipping_settings',
        value: updated,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;
  },
};
