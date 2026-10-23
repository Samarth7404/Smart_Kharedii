-- Smart Khareedi: Database Validation Queries
-- Purpose: Check product, variant, price, and retailer-link data.
-- These queries are read-only and do not modify database records.

USE smart_khareedi;

-- 1. Count the total products in the database
SELECT COUNT(*) AS total_products
FROM products;

-- 2. Count products and retailer price records for each phone
SELECT
    p.product_id,
    p.product_name,
    COUNT(DISTINCT pp.platform_id) AS retailer_count,
    COUNT(pp.price_id) AS price_record_count
FROM products AS p
LEFT JOIN product_prices AS pp
    ON p.product_id = pp.product_id
GROUP BY p.product_id, p.product_name
ORDER BY p.product_id;

-- 3. Find products without any price records
SELECT
    p.product_id,
    p.product_name
FROM products AS p
LEFT JOIN product_prices AS pp
    ON p.product_id = pp.product_id
WHERE pp.price_id IS NULL;

-- 4. Find price records with missing or blank product URLs
SELECT
    p.product_name,
    pl.platform_name,
    pp.price
FROM product_prices AS pp
JOIN products AS p
    ON pp.product_id = p.product_id
JOIN platforms AS pl
    ON pp.platform_id = pl.platform_id
WHERE pp.product_url IS NULL
   OR TRIM(pp.product_url) = '';

-- 5. Find generic retailer homepage URLs
-- These may need replacement with direct product links.
SELECT
    p.product_name,
    pl.platform_name,
    pp.product_url
FROM product_prices AS pp
JOIN products AS p
    ON pp.product_id = p.product_id
JOIN platforms AS pl
    ON pp.platform_id = pl.platform_id
WHERE LOWER(TRIM(pp.product_url)) IN (
    'https://www.amazon.in/',
    'https://www.flipkart.com/',
    'https://www.croma.com/',
    'https://www.vijaysales.com/'
);

-- 6. Find products with fewer than four retailer records
SELECT
    p.product_id,
    p.product_name,
    COUNT(DISTINCT pp.platform_id) AS retailer_count
FROM products AS p
LEFT JOIN product_prices AS pp
    ON p.product_id = pp.product_id
GROUP BY p.product_id, p.product_name
HAVING COUNT(DISTINCT pp.platform_id) < 4
ORDER BY retailer_count, p.product_name;

-- 7. Compare current prices for a chosen phone
-- Change the search term to another phone when needed.
SELECT
    p.product_name,
    pl.platform_name,
    pp.price,
    pp.availability,
    pp.product_url,
    pp.updated_at
FROM product_prices AS pp
JOIN products AS p
    ON pp.product_id = p.product_id
JOIN platforms AS pl
    ON pp.platform_id = pl.platform_id
WHERE p.product_name LIKE '%Galaxy S26%'
ORDER BY pp.price ASC;

-- 8. Review recent price history
SELECT
    p.product_name,
    pl.platform_name,
    ph.price,
    ph.availability,
    ph.recorded_at
FROM price_history AS ph
JOIN products AS p
    ON ph.product_id = p.product_id
JOIN platforms AS pl
    ON ph.platform_id = pl.platform_id
ORDER BY ph.recorded_at DESC;