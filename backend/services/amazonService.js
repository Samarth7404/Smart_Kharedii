async function searchAmazon(query) {
    const products = [
        {
            product_name: "Apple iPhone 17",
            brand: "Apple",
            model: "iPhone 17",
            variant: "8GB RAM / 128GB",
            price: 79999,
            currency: "INR",
            availability: "Available",
            product_url: "https://www.amazon.in/",
            image_url: ""
        }
    ];

    const filteredProducts = products.filter((product) =>
        product.product_name.toLowerCase().includes(query.toLowerCase()) ||
        product.brand.toLowerCase().includes(query.toLowerCase()) ||
        product.model.toLowerCase().includes(query.toLowerCase())
    );

    return {
        platform: "Amazon",
        query: query,
        products: filteredProducts
    };
}

module.exports = {
    searchAmazon
};