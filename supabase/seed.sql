-- ==============================================================================
-- KANCHI JEWELRY - OPTIONAL INITIAL SEED DATA
-- Run this in your Supabase SQL Editor if you want initial catalog items to test with.
-- ==============================================================================

-- 1. SEED CATEGORIES
INSERT INTO public.categories (id, name, slug, description, image_url, is_active, sort_order)
VALUES
    ('c1111111-1111-1111-1111-111111111111', 'Rings', 'rings', 'Handcrafted solitaire, cocktail, and heritage polki rings in 22K hallmarked gold.', 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1000&q=80', true, 1),
    ('c2222222-2222-2222-2222-222222222222', 'Chains', 'chains', 'Graceful twisted, rope, and traditional temple link chains crafted with heirloom finesse.', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=80', true, 2),
    ('c3333333-3333-3333-3333-333333333333', 'Bracelets', 'bracelets', 'Sculptural temple kangan bangles, diamond cuff bracelets, and delicate filigree cuffs.', 'https://images.unsplash.com/photo-1611591475810-7e3d7a863750?auto=format&fit=crop&w=1000&q=80', true, 3),
    ('c4444444-4444-4444-4444-444444444444', 'Necklaces', 'necklaces', 'Regal royal chokers, uncut polki haar, and bridal statement necklaces with natural gemstones.', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1000&q=80', true, 4)
ON CONFLICT (slug) DO NOTHING;

-- 2. SEED PRODUCTS
INSERT INTO public.products (
    id, name, slug, sku, description, price, discount_price, category_id,
    material, weight, dimensions, colour, collection, occasion, stock_quantity, is_featured, is_active
)
VALUES
    (
        'p1111111-1111-1111-1111-111111111111',
        'Aadhya Royal Polki Solitaire Ring',
        'aadhya-royal-polki-solitaire-ring',
        'KJ-RNG-001',
        'A magnificent handcrafted cocktail ring featuring an uncut polki diamond encircled by fine 22K yellow gold filigree and subtle black enamel accents.',
        84500.00,
        79900.00,
        'c1111111-1111-1111-1111-111111111111',
        '22K Yellow Gold & Polki Diamond',
        '8.4 grams',
        '22mm diameter',
        'Yellow Gold',
        'Royal Polki Heritage',
        'Festive & Bridal',
        8,
        true,
        true
    ),
    (
        'p2222222-2222-2222-2222-222222222222',
        'Surya Hand-Twisted Rope Chain',
        'surya-hand-twisted-rope-chain',
        'KJ-CHN-002',
        'Classical South Indian heritage rope chain intricately twisted by master goldsmiths in hallmarked 22K gold. Elegant when worn solo or layered.',
        125000.00,
        NULL,
        'c2222222-2222-2222-2222-222222222222',
        '22K Hallmarked Gold',
        '24.2 grams',
        '20 inches length',
        'Warm Yellow Gold',
        'Temple Classic',
        'Everyday Luxury',
        5,
        true,
        true
    ),
    (
        'p3333333-3333-3333-3333-333333333333',
        'Kamakshi Floral Temple Kangan Pair',
        'kamakshi-floral-temple-kangan-pair',
        'KJ-BRC-003',
        'A pair of traditional solid gold temple bangles adorned with high-relief floral carvings and bezel-set Burmese rubies.',
        248000.00,
        235000.00,
        'c3333333-3333-3333-3333-333333333333',
        '22K Gold & Natural Rubies',
        '46.8 grams',
        'Size 2.6 (60mm diameter)',
        'Antique Matte Gold',
        'Temple Heritage',
        'Bridal',
        3,
        true,
        true
    ),
    (
        'p4444444-4444-4444-4444-444444444444',
        'Nitya Heritage Choker Necklace',
        'nitya-heritage-choker-necklace',
        'KJ-NCK-004',
        'Opulent bridal choker featuring graduating rows of uncut diamonds with Basra pearl drops and handcrafted emerald cabochons.',
        395000.00,
        375000.00,
        'c4444444-4444-4444-4444-444444444444',
        '22K Gold, Polki & Basra Pearls',
        '72.6 grams',
        'Adjustable dori thread (14-18 in)',
        'Yellow Gold with Emerald Accents',
        'Kanchi Imperial',
        'Bridal',
        2,
        true,
        true
    ),
    (
        'p5555555-5555-5555-5555-555555555555',
        'Veda Minimalist Diamond Band',
        'veda-minimalist-diamond-band',
        'KJ-RNG-005',
        'Understated modern eternity ring in 18K yellow gold flush-set with brilliant-cut diamonds. Minimal, contemporary luxury.',
        52000.00,
        NULL,
        'c1111111-1111-1111-1111-111111111111',
        '18K Yellow Gold & VVS Diamonds',
        '4.1 grams',
        '3mm band width',
        'Yellow Gold',
        'Contemporary Fine',
        'Everyday Luxury',
        12,
        false,
        true
    ),
    (
        'p6666666-6666-6666-6666-666666666666',
        'Meera Fluted Gold Link Chain',
        'meera-fluted-gold-link-chain',
        'KJ-CHN-006',
        'A sleek Italian-inspired interlocking box link chain sculpted in polished 22K yellow gold with a secure safety lobster clasp.',
        98000.00,
        92000.00,
        'c2222222-2222-2222-2222-222222222222',
        '22K Yellow Gold',
        '18.0 grams',
        '18 inches length',
        'Yellow Gold',
        'Contemporary Fine',
        'Everyday Luxury',
        6,
        false,
        true
    ),
    (
        'p7777777-7777-7777-7777-777777777777',
        'Rukmini Open Filigree Cuff',
        'rukmini-open-filigree-cuff',
        'KJ-BRC-007',
        'Delicate architectural open cuff bracelet crafted with lace-like gold wirework and cabochon emerald terminal caps.',
        142000.00,
        NULL,
        'c3333333-3333-3333-3333-333333333333',
        '22K Gold & Zambian Emeralds',
        '26.5 grams',
        'Adjustable open wrist size',
        'Yellow Gold',
        'Temple Heritage',
        'Festive',
        4,
        false,
        true
    ),
    (
        'p8888888-8888-8888-8888-888888888888',
        'Devi Peacock Kasu Haram Necklace',
        'devi-peacock-kasu-haram-necklace',
        'KJ-NCK-008',
        'Classic South Indian Kasu Mala long necklace featuring embossed Lakshmi coin medallions crowned by sculpted peacock motifs.',
        460000.00,
        438000.00,
        'c4444444-4444-4444-4444-444444444444',
        '22K Hallmarked Gold',
        '88.2 grams',
        '26 inches long haram',
        'Antique Finish Gold',
        'Kanchi Imperial',
        'Bridal',
        1,
        true,
        true
    )
ON CONFLICT (slug) DO NOTHING;

-- 3. SEED PRODUCT IMAGES
INSERT INTO public.product_images (product_id, public_url, is_primary, sort_order)
VALUES
    ('p1111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1000&q=80', true, 1),
    ('p1111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=1000&q=80', false, 2),
    ('p2222222-2222-2222-2222-222222222222', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=80', true, 1),
    ('p3333333-3333-3333-3333-333333333333', 'https://images.unsplash.com/photo-1611591475810-7e3d7a863750?auto=format&fit=crop&w=1000&q=80', true, 1),
    ('p4444444-4444-4444-4444-444444444444', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1000&q=80', true, 1),
    ('p5555555-5555-5555-5555-555555555555', 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=1000&q=80', true, 1),
    ('p6666666-6666-6666-6666-666666666666', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=80', true, 1),
    ('p7777777-7777-7777-7777-777777777777', 'https://images.unsplash.com/photo-1611591475810-7e3d7a863750?auto=format&fit=crop&w=1000&q=80', true, 1),
    ('p8888888-8888-8888-8888-888888888888', 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=1000&q=80', true, 1)
ON CONFLICT DO NOTHING;

-- 4. SEED SITE SETTINGS
INSERT INTO public.site_settings (key, value)
VALUES
    ('brand_info', '{
        "brand_name": "KANCHI JEWELRY",
        "tagline": "Timeless Jewellery. Endless Elegance.",
        "phone": "PHONE_NUMBER_HERE",
        "email": "EMAIL_HERE",
        "address": "ADDRESS_HERE",
        "whatsapp": "WHATSAPP_NUMBER_HERE",
        "instagram": "INSTAGRAM_URL_HERE",
        "facebook": "FACEBOOK_URL_HERE",
        "google_maps": "GOOGLE_MAPS_URL_HERE",
        "business_hours": "Monday - Saturday: 10:30 AM - 8:30 PM | Sunday: By Appointment",
        "support_note": "For bespoke bridal appointments and heirloom customizations, contact our concierge."
    }'::jsonb),
    ('shipping_settings', '{
        "free_shipping_threshold": 50000,
        "standard_shipping_fee": 500,
        "insured_courier": true,
        "estimated_days": "3-5 Business Days with Insured Armed Courier"
    }'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
