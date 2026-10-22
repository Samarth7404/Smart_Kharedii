const dotenv = require("dotenv");
const { getJson } = require("serpapi");

dotenv.config();

const STORES = [
    {
        name: "Amazon",
        searchName: "Amazon",
        matches: ["amazon"],
        domains: ["amazon.in"]
    },
    {
        name: "Flipkart",
        searchName: "Flipkart",
        matches: ["flipkart"],
        domains: ["flipkart.com"]
    },
    {
        name: "Vijay Sales",
        searchName: "Vijay Sales",
        matches: ["vijay sales", "vijaysales"],
        domains: ["vijaysales.com"]
    },
    {
        name: "Croma",
        searchName: "Croma",
        matches: ["croma"],
        domains: ["croma.com"]
    }
];

function matchesStore(source, store) {
    const value = (source || "").toLowerCase();
    return store.matches.some((name) => value.includes(name));
}

function normalizeText(value) {
    return String(value || "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
}

function matchesProduct(title, query) {
    const requestedWords = normalizeText(query)
        .split(/\s+/)
        .filter(Boolean);

    const titleWords = normalizeText(title)
        .split(/\s+/);

    // Require every search term to appear in the product title.
    return requestedWords.length > 0 &&
        requestedWords.every((word) => titleWords.includes(word));
}

function parsePrice(value, extractedPrice) {
    if (typeof extractedPrice === "number") {
        return Number.isFinite(extractedPrice) && extractedPrice > 0
            ? extractedPrice
            : null;
    }

    const cleaned = String(value || "").replace(/[^\d.]/g, "");
    const price = Number(cleaned);

    return Number.isFinite(price) && price > 0 ? price : null;
}

function getRetailerUrl(link, store) {
    if (!link) return "";

    try {
        const url = new URL(link);

        // Unwrap a Google URL only if its target is a retailer page.
        if (
            url.hostname.includes("google.") &&
            url.searchParams.has("q")
        ) {
            const target = url.searchParams.get("q");
            return getRetailerUrl(target, store);
        }

        const hostname = url.hostname.toLowerCase();
        const allowedDomain = store.domains.some(
            (domain) =>
                hostname === domain || hostname.endsWith("." + domain)
        );

        if (
            url.protocol !== "https:" ||
            !allowedDomain
        ) {
            return "";
        }

        return url.href;
    } catch {
        return "";
    }
}

async function searchStore(query, store) {
    try {
        const results = await getJson({
            engine: "google_shopping",
            q: `${store.searchName} ${query}`,
            location: "India",
            gl: "in",
            hl: "en",
            api_key: process.env.SERPAPI_KEY
        });

        const shoppingResults = results.shopping_results || [];

        // Keep only results from the requested store and phone model.
        const storeResult = shoppingResults.find((item) =>
            matchesStore(item.source, store) &&
            matchesProduct(item.title, query) &&
            parsePrice(item.price, item.extracted_price) !== null
        );

        if (!storeResult) {
            console.log(`${store.name}: no matching product found`);
            return null;
        }

        let productUrl = "";

        // Try to get the retailer's actual offer link.
        if (storeResult.product_id) {
            const details = await getJson({
                engine: "google_product",
                product_id: storeResult.product_id,
                gl: "in",
                hl: "en",
                offer_view: true,
                api_key: process.env.SERPAPI_KEY
            });

            const sellers =
                details.sellers_results?.online_sellers || [];

            const seller = sellers.find((item) =>
                matchesStore(item.name, store) &&
                item.link
            );

            if (seller?.link) {
                productUrl = getRetailerUrl(seller.link, store);
            }
        }

        // Use the shopping result link only if it is a retailer URL.
        if (!productUrl) {
            productUrl = getRetailerUrl(storeResult.link, store);
        }

        // Never return a homepage or Google Shopping link as a product link.
        if (!productUrl) {
            console.log(`${store.name}: no verified retailer product URL`);
            return null;
        }

        const price = parsePrice(
            storeResult.price,
            storeResult.extracted_price
        );

        if (price === null) return null;

        return {
            platform: store.name,
            price,
            product_url: productUrl,
            availability: storeResult.availability || "Available",
            external_product_id: storeResult.product_id || null
        };
    } catch (error) {
        console.error(`${store.name} search error:`, error.message);
        return null;
    }
}

async function updatePrices(query) {
    const results = [];

    for (const store of STORES) {
        const result = await searchStore(query, store);

        if (result) {
            results.push(result);
        }
    }

    return results;
}

module.exports = { updatePrices };