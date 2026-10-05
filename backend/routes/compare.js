const express = require("express");
const db = require("../db");

const router = express.Router();

router.get("/compare", (req, res) => {
    const { query } = req.query;

    if (!query || !query.trim()) {
        return res.status(400).json({
            error: "Please provide a search query"
        });
    }

    const searchQuery = `%${query.trim()}%`;

    const sql = `
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
        INNER JOIN product_prices pp
            ON v.variant_id = pp.variant_id
        INNER JOIN platforms pl
            ON pp.platform_id = pl.platform_id
        WHERE
            p.product_name LIKE ?
            OR p.brand LIKE ?
            OR p.model LIKE ?
        ORDER BY
            p.product_id,
            v.variant_id,
            pp.price ASC
    `;

    db.query(
        sql,
        [searchQuery, searchQuery, searchQuery],
        (err, results) => {

            if (err) {
                console.error("Database Error:", err.message);

                return res.status(500).json({
                    error: "Database error",
                    message: err.message
                });
            }

            if (results.length === 0) {
                return res.json({
                    query: query,
                    products: []
                });
            }

            const productMap = {};

            results.forEach((row) => {

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

                if (!productMap[row.product_id].variants[row.variant_id]) {
                    productMap[row.product_id].variants[row.variant_id] = {
                        variant_id: row.variant_id,
                        variant_name: row.variant_name,
                        storage: row.storage,
                        ram: row.ram,
                        color: row.color,
                        prices: []
                    };
                }

                productMap[row.product_id]
                    .variants[row.variant_id]
                    .prices
                    .push({
                        platform_id: row.platform_id,
                        platform: row.platform_name,
                        price: Number(row.price),
                        product_url: row.product_url,
                        availability: row.availability,
                        updated_at: row.updated_at
                    });
            });

            const products = Object.values(productMap).map((product) => {

                product.variants = Object.values(product.variants);

                product.variants.forEach((variant) => {

                    const availablePrices = variant.prices.filter(
                        (item) =>
                            item.availability === "Available" &&
                            item.price !== null
                    );

                    if (availablePrices.length > 0) {

                        const lowestPrice = Math.min(
                            ...availablePrices.map((item) => item.price)
                        );

                        variant.lowest_price = lowestPrice;

                        variant.lowest_platform =
                            availablePrices.find(
                                (item) => item.price === lowestPrice
                            ).platform;

                        variant.prices = variant.prices.map((item) => ({
                            ...item,
                            lowest_price: item.price === lowestPrice
                        }));

                    } else {

                        variant.lowest_price = null;
                        variant.lowest_platform = null;

                        variant.prices = variant.prices.map((item) => ({
                            ...item,
                            lowest_price: false
                        }));
                    }
                });

                return product;
            });

            res.json({
                query: query,
                total_products: products.length,
                products: products
            });
        }
    );
});

module.exports = router;