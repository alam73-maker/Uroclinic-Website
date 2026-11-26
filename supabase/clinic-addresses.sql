update public.locations
set address_en = '51 Osman Ibn Affan St, Ismailia Square, Heliopolis, Cairo',
    address_ar = '51 شارع عثمان بن عفان، ميدان الإسماعيلية، مصر الجديدة، القاهرة',
    map_url = 'https://www.google.com/maps/search/?api=1&query=51+Osman+Ibn+Affan+St,+Ismailia+Square,+Heliopolis,+Cairo'
where name_en ilike '%heliopolis%';
