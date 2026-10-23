# Smart Khareedi Database

This folder documents the MySQL database used by Smart Khareedi to compare smartphone prices across online retailers.

## Files
- `schema.sql`: structure-only setup for the nine tables; no existing records or user data.
- `testing.md`: read-only SQL checks for products, prices, retailer URLs, and price history.

## Tables
| Table | Purpose |
|---|---|
| `categories` | Product categories, such as Smartphone. |
| `platforms` | Retailers such as Amazon, Flipkart, Vijay Sales, and Croma. |
| `products` | Phone name, brand, model, category, image URL, and description. |
| `product_variants` | Storage, RAM, colour, and variant label for each product. |
| `product_prices` | Current price, platform, purchase URL, availability, and update time. |
| `price_history` | Historical price observations. |
| `users` | User profile fields and password hash. Never store plaintext passwords. |
| `search_history` | Search terms with an optional user reference. |
| `wishlist` | Links users to products and optionally a variant. |

## Main relationships
- A category can be associated with multiple products.
- A product can have multiple variants.
- Price records reference products and retailer platforms, and can reference a variant.
- Price history records reference products and retailer platforms, and can reference a variant.
- Search history can optionally reference a user.
- Wishlist records reference a user and product, and can reference a variant.

## Setup
1. Use MySQL 8.0 or compatible.
2. Open `schema.sql` in MySQL Workbench.
3. Review the target database name before running it.
4. Test in a development database first.
5. Insert lookup rows and then product, variant, and price data in foreign-key order.

The script uses `CREATE TABLE IF NOT EXISTS`; it does not drop existing tables. Existing tables are not altered if they already exist, so this is a setup script, not a migration tool.

## Safety
- Never commit `.env` files, database passwords, API keys, or real user data.
- Do not publish raw dumps containing user data.
- Retailer prices and URLs can change; verify them before relying on them.
- The schema was prepared from the database dump shared for this project. Test it in a separate development database before teammates use it.
