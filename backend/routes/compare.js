const express = require("express");
const router = express.Router();

const db = require("../db");
const promiseDb = db.promise();

function getVerifiedProductUrl(value) {
    if (!value) return "";

    try {
        const url = new URL(value);
        const host = url.hostname.toLowerCase();

        const allowedDomains = [
            "amazon.in",
            "amzn.in",
            "flipkart.com",
            "croma.com",
            "vijaysales.com"
        ];

        const allowed = allowedDomains.some(
            (domain) => host === domain || host.endsWith("." + domain)
        );

        // Reject non-HTTPS links and retailer homepages.
        if (
            url.protocol !== "https:" ||
            !allowed ||
            url.pathname === "/"
        ) {
            return "";
        }

        return url.href;
    } catch {
        return "";
    }
}

router.get("/compare", async (req, res) => {
    const query = (req.query.query || "").trim();

    if (!query) {
        return res.status(400).json({
            products: [],
            message: "Search query is required"
        });
    }

    try {
        const searchTerm = `%${query}%`;

        const [rows] = await promiseDb.query(
            `
            SELECT
                p.product_id,
                p.product_name,
                p.brand,
                p.model,
                p.category,
                p.image_url,
                p.description,
                v.variant_id,
                v.variant_name,
                v.storage,
                v.ram,
                v.color,
                pp.price,
                pp.product_url,
                pp.availability,
                pp.updated_at,
                pl.platform_id,
                pl.platform_name
            FROM products p
            INNER JOIN product_variants v
                ON p.product_id = v.product_id
            LEFT JOIN product_prices pp
                ON v.variant_id = pp.variant_id
            LEFT JOIN platforms pl
                ON pp.platform_id = pl.platform_id
            WHERE
                p.product_name LIKE ?
                OR p.brand LIKE ?
                OR p.model LIKE ?
                OR v.variant_name LIKE ?
            ORDER BY p.product_name, v.variant_id, pp.price ASC
            `,
            [searchTerm, searchTerm, searchTerm, searchTerm]
        );

        const productMap = {};

        for (const row of rows) {
            if (!productMap[row.product_id]) {
                productMap[row.product_id] = {
                    product_id: row.product_id,
                    product_name: row.product_name,
                    brand: row.brand,
                    model: row.model,
                    category: row.category,
                    image_url: row.image_url,
                    description: row.description,
                    variants: {}
                };
            }

            const product = productMap[row.product_id];

            if (!product.variants[row.variant_id]) {
                product.variants[row.variant_id] = {
                    variant_id: row.variant_id,
                    variant_name: row.variant_name,
                    storage: row.storage,
                    ram: row.ram,
                    color: row.color,
                    prices: []
                };
            }

            if (row.platform_id !== null && row.price !== null) {
                product.variants[row.variant_id].prices.push({
                    platform_id: row.platform_id,
                    platform: row.platform_name,
                    price: Number(row.price),
                    product_url: getVerifiedProductUrl(row.product_url),
                    availability: row.availability || "Available",
                    updated_at: row.updated_at,
                    lowest_price: false
                });
            }
        }

        const products = Object.values(productMap).map((product) => {
            product.variants = Object.values(product.variants);

            for (const variant of product.variants) {
                const availablePrices = variant.prices.filter((item) => {
    const status = String(item.availability || "Available")
        .trim()
        .toLowerCase();

    return (
        status === "available" &&
        Number.isFinite(item.price) &&
        item.price > 0
    );
});

                const lowestPrice = availablePrices.length
                    ? Math.min(...availablePrices.map((item) => item.price))
                    : null;

                variant.lowest_price = lowestPrice;

                variant.lowest_platform =
                    lowestPrice === null
                        ? null
                        : availablePrices.find(
                              (item) => item.price === lowestPrice
                          ).platform;

                variant.prices = variant.prices.map((item) => ({
                    ...item,
                    lowest_price:
                        lowestPrice !== null &&
                        item.price === lowestPrice
                }));
            }

            return product;
        });

        res.json({
            total_products: products.length,
            products
        });
    } catch (error) {
        console.error("Compare Error:", error.message);

        res.status(500).json({
            products: [],
            message: "Failed to compare products"
        });
    }
});

module.exports = router;