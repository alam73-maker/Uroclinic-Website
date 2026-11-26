update public.locations
set address_en = '51 Osman Ibn Affan St, Ismailia Square, Heliopolis, Cairo',
    address_ar = '51 شارع عثمان بن عفان، ميدان الإسماعيلية، مصر الجديدة، القاهرة',
    map_url = 'https://maps.google.com/?cid=4485193615831728264'
where name_en ilike '%heliopolis%';
