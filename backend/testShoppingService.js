const { searchShopping } = require("./services/shoppingService");

async function test() {
try {
const results = await searchShopping("Samsung Galaxy S25 Ultra");

    console.log("\nSHOPPING RESULTS:\n");

    console.table(
        results.map((item) => ({
            product_name: item.product_name,
            platform: item.platform,
            price: item.price,
            product_url: item.product_url,
            availability: item.availability
        }))
    );
} catch (error) {
    console.error("TEST ERROR:", error.message);
}

}

test();