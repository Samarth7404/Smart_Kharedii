# Database Testing Notes

Run these read-only checks against a development `smart_khareedi` database.

## 1. Confirm tables
```sql
USE smart_khareedi;
SHOW TABLES;
```

## 2. Count products and variants
```sql
SELECT COUNT(*) AS product_count FROM products;
SELECT COUNT(*) AS variant_count FROM product_variants;
```

## 3. Inspect current retailer prices
```sql
SELECT p.product_name, v.variant_name, pl.platform_name,
       pp.price, pp.availability, pp.product_url, pp.updated_at
FROM product_prices AS pp
JOIN products AS p ON p.product_id = pp.product_id
JOIN platforms AS pl ON pl.platform_id = pp.platform_id
LEFT JOIN product_variants AS v ON v.variant_id = pp.variant_id
ORDER BY p.product_name, v.variant_id, pl.platform_name;
```

## 4. Find missing purchase URLs
```sql
SELECT p.product_name, pl.platform_name, pp.price
FROM product_prices AS pp
JOIN products AS p ON p.product_id = pp.product_id
JOIN platforms AS pl ON pl.platform_id = pp.platform_id
WHERE pp.product_url IS NULL OR TRIM(pp.product_url) = '';
```

## 5. Compare prices for a phone
Change the search text as needed.
```sql
SELECT p.product_name, pl.platform_name, pp.price, pp.product_url
FROM product_prices AS pp
JOIN products AS p ON p.product_id = pp.product_id
JOIN platforms AS pl ON pl.platform_id = pp.platform_id
WHERE p.product_name LIKE '%Galaxy S26%'
ORDER BY pp.price ASC;
```

## 6. Review price history
```sql
SELECT p.product_name, pl.platform_name, ph.price,
       ph.availability, ph.recorded_at
FROM price_history AS ph
JOIN products AS p ON p.product_id = ph.product_id
JOIN platforms AS pl ON pl.platform_id = ph.platform_id
ORDER BY ph.recorded_at DESC;
```

## 7. Check duplicate non-NULL variant/platform pairs
```sql
SELECT variant_id, platform_id, COUNT(*) AS record_count
FROM product_prices
WHERE variant_id IS NOT NULL
GROUP BY variant_id, platform_id
HAVING COUNT(*) > 1;
```
This should return no rows. MySQL unique indexes allow multiple NULL values, so records with a NULL `variant_id` need separate validation if your application uses them.
