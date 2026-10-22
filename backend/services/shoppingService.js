 const dotenv = require("dotenv");
const { getJson } = require("serpapi");

dotenv.config();

async function searchShopping(query) {
    try {
        const results = await getJson({
            engine: "google_shopping",
            q: query,
            location: "India",
            api_key: process.env.SERPAPI_KEY
        });

        const shoppingResults = results.shopping_results || [];

        return shoppingResults.map((item) => ({
            product_name: item.title || "",
            platform: item.source || "",
            price: item.price || "",
            product_url: item.link || item.product_link || "",
            thumbnail: item.thumbnail || "",
            availability: item.availability || ""
        }));

    } catch (error) {
        console.error("Shopping Search Error:", error.message);
        return [];
    }
}

module.exports = {
    searchShopping
};