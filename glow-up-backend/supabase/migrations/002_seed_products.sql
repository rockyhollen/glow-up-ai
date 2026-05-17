-- ═══════════════════════════════════════════════════════════════
-- GLOW-UP AI — AFFILIATE PRODUCT SEED DATA
-- Run AFTER 001_initial_schema.sql
-- ═══════════════════════════════════════════════════════════════

INSERT INTO affiliate_products
  (brand, label, slug, category, subcategory, tier, price_min, price_max, price_display,
   affiliate_url, affiliate_network, commission_pct,
   image_url, archetype_tags, style_tags, goal_tags, concern_tags, color_options,
   badge, conversion_note, is_featured, sort_order)
VALUES

-- ─────────────────────────────────────────────────────────────
-- TOPS
-- ─────────────────────────────────────────────────────────────
(
  'Uniqlo', 'Supima Cotton Slim Fit Tee', 'uniqlo-supima-tee',
  'tops', 'tshirt', 'budget', 1500, 2000, '$15–$20',
  'https://www.uniqlo.com/us/en/products/E449645-000',
  'rakuten', 3.00,
  'https://image.uniqlo.com/UQ/ST3/us/imagesgoods/449645/item/usgoods_09_449645.jpg',
  ARRAY['structured-masculine','clean-classic','sharp','streetwear'],
  ARRAY['casual','dating','everyday','smart-casual'],
  ARRAY['dating','confidence','social','professional'],
  ARRAY[]::TEXT[],
  ARRAY['Black','White','Navy','Olive','Grey'],
  'Best Value', 'Start here — 2x black, 1x white minimum',
  TRUE, 1
),
(
  'Everlane', 'Premium Heavyweight Crew Tee', 'everlane-heavyweight-tee',
  'tops', 'tshirt', 'mid', 3500, 4500, '$35–$45',
  'https://www.everlane.com/products/mens-premium-weight-crew',
  'impact', 8.00,
  'https://everlane.com/cdn/shop/products/M_PHWCREW_BLK.jpg',
  ARRAY['structured-masculine','clean-classic','sharp'],
  ARRAY['casual','dating','smart-casual','social'],
  ARRAY['dating','confidence','social'],
  ARRAY[]::TEXT[],
  ARRAY['Black','Navy','Heather Grey','Dark Olive'],
  'Most Versatile', NULL,
  FALSE, 2
),
(
  'Theory', 'Precise Fitted Crewneck Tee', 'theory-precise-tee',
  'tops', 'tshirt', 'premium', 9500, 12000, '$95–$120',
  'https://www.theory.com/mens-t-shirts-and-tanks/mens-t-shirts',
  'direct', 5.00,
  'https://www.theory.com/dw/image/v2/BFXS_PRD/on/demandware.static/-/Sites-theory-master-catalog/default/dw7e0e4a5f/images/large/J0694525_E08_A.jpg',
  ARRAY['structured-masculine','sharp'],
  ARRAY['dating','social','elevated'],
  ARRAY['dating','professional'],
  ARRAY[]::TEXT[],
  ARRAY['Black','White','Navy'],
  'High Impact', 'Most clients upgrade here',
  FALSE, 3
),
(
  'Uniqlo', 'Oxford Button-Down Shirt', 'uniqlo-oxford-buttondown',
  'tops', 'button-up', 'budget', 3000, 4000, '$30–$40',
  'https://www.uniqlo.com/us/en/products/E449033-000',
  'rakuten', 3.00,
  'https://image.uniqlo.com/UQ/ST3/us/imagesgoods/449033/item/usgoods_62_449033.jpg',
  ARRAY['clean-classic','sharp','structured-masculine'],
  ARRAY['smart-casual','professional','dating'],
  ARRAY['professional','dating','confidence'],
  ARRAY[]::TEXT[],
  ARRAY['White','Light Blue','Navy','Pink'],
  'Social Weapon', 'Instantly levels you up from casual to sharp',
  TRUE, 4
),
(
  'Bonobos', 'Slim Fit Tech Oxford Shirt', 'bonobos-tech-oxford',
  'tops', 'button-up', 'mid', 8800, 11000, '$88–$110',
  'https://bonobos.com/collections/dress-shirts',
  'impact', 6.00,
  'https://bonobos.com/cdn/shop/products/bonobos-mens-shirt-slim-fit.jpg',
  ARRAY['sharp','structured-masculine','clean-classic'],
  ARRAY['professional','smart-casual','dating'],
  ARRAY['professional','dating'],
  ARRAY[]::TEXT[],
  ARRAY['White','Light Blue','Sky Blue','Grey'],
  'Most clients upgrade here', NULL,
  FALSE, 5
),

-- ─────────────────────────────────────────────────────────────
-- PANTS
-- ─────────────────────────────────────────────────────────────
(
  'Levi''s', '511 Slim Fit Jeans', 'levis-511-slim',
  'pants', 'jeans', 'budget', 6000, 8000, '$60–$80',
  'https://www.levi.com/US/en_US/apparel/clothing/bottoms/511-slim-fit-mens-jeans/p/045115501',
  'rakuten', 4.00,
  'https://lsco.scene7.com/is/image/lsco/045115501-front-pdp.jpg',
  ARRAY['structured-masculine','clean-classic','streetwear','rugged'],
  ARRAY['casual','dating','everyday','smart-casual'],
  ARRAY['dating','confidence','social'],
  ARRAY[]::TEXT[],
  ARRAY['Dark Blue','Black','Grey','Light Blue'],
  'Best Value', 'Slim fit — not skinny. The foundation jean.',
  TRUE, 1
),
(
  'Uniqlo', 'Slim Fit Chino Pants', 'uniqlo-slim-chino',
  'pants', 'chinos', 'budget', 4000, 5000, '$40–$50',
  'https://www.uniqlo.com/us/en/products/E449842-000',
  'rakuten', 3.00,
  'https://image.uniqlo.com/UQ/ST3/us/imagesgoods/449842/item/usgoods_71_449842.jpg',
  ARRAY['clean-classic','sharp','structured-masculine'],
  ARRAY['smart-casual','professional','casual'],
  ARRAY['professional','confidence','social'],
  ARRAY[]::TEXT[],
  ARRAY['Beige','Navy','Olive','Black','Stone'],
  'Most Versatile', 'Works with everything in the wardrobe',
  TRUE, 2
),
(
  'Everlane', 'Performance Chino Slim', 'everlane-performance-chino',
  'pants', 'chinos', 'mid', 6800, 8800, '$68–$88',
  'https://www.everlane.com/products/mens-slim-chino',
  'impact', 8.00,
  'https://everlane.com/cdn/shop/products/M_PERFCHINO_KHAKI.jpg',
  ARRAY['sharp','structured-masculine','clean-classic'],
  ARRAY['professional','smart-casual','dating'],
  ARRAY['professional','dating'],
  ARRAY[]::TEXT[],
  ARRAY['Khaki','Navy','Black','Stone'],
  'High Impact', NULL,
  FALSE, 3
),
(
  'Bonobos', 'Stretch Slim Fit Chinos', 'bonobos-stretch-slim-chino',
  'pants', 'chinos', 'mid', 9800, 12800, '$98–$128',
  'https://bonobos.com/collections/pants',
  'impact', 6.00,
  'https://bonobos.com/cdn/shop/products/bonobos-slim-chino.jpg',
  ARRAY['sharp','structured-masculine'],
  ARRAY['professional','smart-casual','dating'],
  ARRAY['professional','dating'],
  ARRAY[]::TEXT[],
  ARRAY['Khaki','Navy','Olive','Black'],
  'Best Fit', 'Best fit on the market at this price',
  FALSE, 4
),
(
  'APC', 'Petit New Standard Slim Jeans', 'apc-petit-new-standard',
  'pants', 'jeans', 'premium', 20000, 25000, '$200–$250',
  'https://www.apc-us.com/collections/jeans-men',
  'direct', 0.00,
  'https://www.apc-us.com/cdn/shop/products/apc-jeans-petit-new-standard.jpg',
  ARRAY['structured-masculine','sharp','clean-classic'],
  ARRAY['dating','social','elevated'],
  ARRAY['dating','social'],
  ARRAY[]::TEXT[],
  ARRAY['Dark Indigo','Black','Raw Denim'],
  'Social Weapon', 'Breaks in perfectly to your body over time',
  FALSE, 5
),

-- ─────────────────────────────────────────────────────────────
-- JACKETS
-- ─────────────────────────────────────────────────────────────
(
  'Uniqlo', 'Blouson Bomber Jacket', 'uniqlo-blouson-bomber',
  'jackets', 'bomber', 'budget', 6000, 8000, '$60–$80',
  'https://www.uniqlo.com/us/en/products/E449234-000',
  'rakuten', 3.00,
  'https://image.uniqlo.com/UQ/ST3/us/imagesgoods/449234/item/usgoods_09_449234.jpg',
  ARRAY['structured-masculine','streetwear','clean-classic'],
  ARRAY['casual','everyday','dating'],
  ARRAY['confidence','dating','social'],
  ARRAY[]::TEXT[],
  ARRAY['Black','Navy','Olive'],
  'Best Value', 'Best entry-level piece to own',
  TRUE, 1
),
(
  'Everlane', 'The Slim Blazer', 'everlane-slim-blazer',
  'jackets', 'blazer', 'mid', 16800, 19800, '$168–$198',
  'https://www.everlane.com/products/mens-slim-blazer',
  'impact', 8.00,
  'https://everlane.com/cdn/shop/products/M_SLIMBLAZER_BLACK.jpg',
  ARRAY['sharp','structured-masculine','clean-classic'],
  ARRAY['professional','smart-casual','dating'],
  ARRAY['professional','dating'],
  ARRAY[]::TEXT[],
  ARRAY['Black','Navy','Charcoal'],
  'Most Versatile', 'One blazer that works for everything',
  TRUE, 2
),
(
  'Schott NYC', 'Perfecto Leather Motorcycle Jacket', 'schott-perfecto-leather',
  'jackets', 'leather', 'premium', 60000, 90000, '$600–$900',
  'https://www.schottnyc.com/product/perfecto-leather-motorcycle-jacket',
  'direct', 0.00,
  'https://www.schottnyc.com/cdn/shop/products/schott-perfecto-black.jpg',
  ARRAY['structured-masculine','rugged','streetwear'],
  ARRAY['dating','social','elevated'],
  ARRAY['dating','social','confidence'],
  ARRAY[]::TEXT[],
  ARRAY['Black','Brown'],
  'Social Weapon 🔥', 'Iconic. Lasts a lifetime. Dating ROI is unmatched.',
  TRUE, 3
),
(
  'Theory', 'Chambers Wool Blazer', 'theory-chambers-blazer',
  'jackets', 'blazer', 'premium', 49500, 59500, '$495–$595',
  'https://www.theory.com/mens-blazers',
  'direct', 5.00,
  'https://www.theory.com/dw/image/v2/BFXS_PRD/on/demandware.static/-/Sites-theory-master-catalog/default/theory-blazer-chambers.jpg',
  ARRAY['sharp','structured-masculine'],
  ARRAY['professional','elevated','dating'],
  ARRAY['professional','dating'],
  ARRAY[]::TEXT[],
  ARRAY['Black','Navy','Charcoal','Camel'],
  'High Impact', 'Most clients upgrade here',
  FALSE, 4
),

-- ─────────────────────────────────────────────────────────────
-- SHOES
-- ─────────────────────────────────────────────────────────────
(
  'Thursday Boot Co.', 'Captain Chelsea Boot', 'thursday-captain-chelsea',
  'shoes', 'chelsea-boot', 'budget', 15000, 20000, '$150–$200',
  'https://thursdayboots.com/collections/mens-boots/products/captain',
  'impact', 10.00,
  'https://thursdayboots.com/cdn/shop/products/thursday-captain-chelsea-black.jpg',
  ARRAY['structured-masculine','clean-classic','sharp','rugged'],
  ARRAY['dating','smart-casual','social','everyday'],
  ARRAY['dating','confidence','social','professional'],
  ARRAY[]::TEXT[],
  ARRAY['Black','Brown','Cognac','Espresso'],
  'Best Value 🔥', 'Best overall shoe purchase you can make',
  TRUE, 1
),
(
  'Adidas', 'Stan Smith Sneakers', 'adidas-stan-smith',
  'shoes', 'sneaker', 'budget', 8500, 11000, '$85–$110',
  'https://www.adidas.com/us/stan-smith-shoes/FX5500.html',
  'impact', 7.00,
  'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/stan-smith-shoes.jpg',
  ARRAY['clean-classic','streetwear','structured-masculine'],
  ARRAY['casual','everyday','smart-casual'],
  ARRAY['confidence','social'],
  ARRAY[]::TEXT[],
  ARRAY['White/Green','White/Navy','Triple White','Core Black'],
  'Most Versatile', 'The clean white sneaker that works with everything',
  TRUE, 2
),
(
  'Cole Haan', 'Grand Crosscourt Chelsea Boot', 'cole-haan-grand-chelsea',
  'shoes', 'chelsea-boot', 'mid', 15000, 20000, '$150–$200',
  'https://www.colehaan.com/grand-crosscourt-modern-chelsea-boot-black-leather/C34922.html',
  'rakuten', 6.00,
  'https://www.colehaan.com/dw/image/v2/AADF_PRD/on/demandware.static/-/Sites-ColHaan-master/default/cole-haan-chelsea-black.jpg',
  ARRAY['sharp','structured-masculine','clean-classic'],
  ARRAY['professional','smart-casual','dating'],
  ARRAY['professional','dating'],
  ARRAY[]::TEXT[],
  ARRAY['Black','British Tan','Dark Brown'],
  'High Impact', NULL,
  FALSE, 3
),
(
  'Clarks', 'Desert Boot', 'clarks-desert-boot',
  'shoes', 'boot', 'mid', 12000, 16000, '$120–$160',
  'https://www.clarksusa.com/clarks-originals-desert-boot/26138226.html',
  'rakuten', 5.00,
  'https://clarksusa.com/cdn/shop/products/clarks-desert-boot-sand.jpg',
  ARRAY['clean-classic','rugged','structured-masculine'],
  ARRAY['casual','smart-casual','dating'],
  ARRAY['confidence','dating','social'],
  ARRAY[]::TEXT[],
  ARRAY['Sand','Beeswax','Black','Tobacco'],
  'Most Versatile', NULL,
  FALSE, 4
),

-- ─────────────────────────────────────────────────────────────
-- GROOMING
-- ─────────────────────────────────────────────────────────────
(
  'Beardbrand', 'Utility Balm Face + Beard', 'beardbrand-utility-balm',
  'grooming', 'beard-care', 'budget', 2200, 2800, '$22–$28',
  'https://www.beardbrand.com/products/utility-balm',
  'shareasale', 12.00,
  'https://www.beardbrand.com/cdn/shop/products/utility-balm-beardbrand.jpg',
  ARRAY['structured-masculine','rugged','clean-classic'],
  ARRAY['everyday','dating'],
  ARRAY['dating','confidence'],
  ARRAY['beard','skin'],
  ARRAY[],
  'Daily Essential', 'Face moisturizer + beard softener in one',
  TRUE, 1
),
(
  'Baxter of California', 'Clay Pomade Medium Hold', 'baxter-clay-pomade',
  'grooming', 'hair-styling', 'mid', 2200, 2800, '$22–$28',
  'https://baxterofcalifornia.com/products/clay-pomade',
  'shareasale', 10.00,
  'https://baxterofcalifornia.com/cdn/shop/products/baxter-clay-pomade.jpg',
  ARRAY['structured-masculine','clean-classic','sharp'],
  ARRAY['everyday','dating','professional'],
  ARRAY['confidence','dating','professional'],
  ARRAY[]::TEXT[],
  ARRAY[],
  'High Impact', 'Matte finish — no shine, just clean texture',
  TRUE, 2
),
(
  'Kiehl''s', 'Facial Fuel Moisturizer SPF 20', 'kiehls-facial-fuel',
  'grooming', 'skincare', 'mid', 3500, 4500, '$35–$45',
  'https://www.kiehls.com/skincare/moisturizers-and-treatments/facial-fuel-energizing-moisture-treatment-for-men/KHL381.html',
  'direct', 0.00,
  'https://www.kiehls.com/dw/image/v2/AANG_PRD/on/demandware.static/-/Sites-kiehls-master-catalog/default/kiehls-facial-fuel.jpg',
  ARRAY['structured-masculine','sharp','clean-classic'],
  ARRAY['everyday','professional'],
  ARRAY['confidence','professional'],
  ARRAY['skin'],
  ARRAY[],
  'Most clients upgrade here', 'SPF + hydration in one step',
  TRUE, 3
),
(
  'Aesop', 'Protective Facial Lotion SPF 25', 'aesop-protective-lotion',
  'grooming', 'skincare', 'premium', 6500, 7500, '$65–$75',
  'https://www.aesop.com/us/p/skin/facial/protective-facial-lotion-spf25/',
  'direct', 0.00,
  'https://www.aesop.com/medias/Aesop-Protective-Facial-Lotion-SPF25.jpg',
  ARRAY['sharp','structured-masculine'],
  ARRAY['everyday','professional','elevated'],
  ARRAY['professional','confidence'],
  ARRAY['skin'],
  ARRAY[],
  'Social Weapon', 'Skin is the first thing people notice',
  FALSE, 4
);
