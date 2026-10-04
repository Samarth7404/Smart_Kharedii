const express = require("express");

const {
    searchAmazon
} = require("../services/amazonService");

const {
    searchFlipkart
} = require("../services/flipkartService");

const {
    searchVijaySales
} = require("../services/vijaySalesService");

const {
    searchCroma
} = require("../services/cromaService");

const router = express.Router();

router.get("/compare", async (req, res) => {
    try {
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({
                error: "Please provide a search query"
            });
        }

        const [
            amazon,
            flipkart,
            vijaySales,
            croma
        ] = await Promise.all([
            searchAmazon(query),
            searchFlipkart(query),
            searchVijaySales(query),
            searchCroma(query)
        ]);

        const allProducts = [
            ...amazon.products.map((product) => ({
                ...product,
                platform: "Amazon"
            })),

            ...flipkart.products.map((product) => ({
                ...product,
                platform: "Flipkart"
            })),

            ...vijaySales.products.map((product) => ({
                ...product,
                platform: "Vijay Sales"
            })),

            ...croma.products.map((product) => ({
                ...product,
                platform: "Croma"
            }))
        ];

        if (allProducts.length === 0) {
            return res.json({
                query: query,
                lowest_price: null,
                lowest_platform: null,
                products: []
            });
        }

        const lowestPrice = Math.min(
            ...allProducts.map((product) => product.price)
        );

        const productsWithLowestPrice = allProducts.map((product) => ({
            ...product,
            lowest_price: product.price === lowestPrice
        }));

        const lowestProduct = productsWithLowestPrice.find(
            (product) => product.lowest_price
        );

        res.json({
            query: query,
            lowest_price: lowestPrice,
            lowest_platform: lowestProduct.platform,
            products: productsWithLowestPrice
        });

    } catch (error) {
        console.error("Comparison Error:", error.message);

        res.status(500).json({
            error: "Failed to compare products"
        });
    }
});

module.exports = router;