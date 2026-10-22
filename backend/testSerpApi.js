 const dotenv = require("dotenv");
const { getJson } = require("serpapi");

dotenv.config();

async function testSearch() {
    try {
        const results = await getJson({
            engine: "google_shopping",
            q: "Samsung Galaxy S25",
            location: "India",
            api_key: process.env.SERPAPI_KEY
        });

        console.log(JSON.stringify(results, null, 2));
    } catch (error) {
        console.error("SerpApi Error:", error.message);
    }
}

testSearch();