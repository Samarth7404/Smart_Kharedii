async function searchCroma(query) {
    const products = [
        {
            product_name: "Apple iPhone 17",
            brand: "Apple",
            model: "iPhone 17",
            variant: "8GB RAM / 128GB",
            price: 77999,
            currency: "INR",
            availability: "Available",
            product_url: "https://www.croma.com/",
            image_url: ""
        }
    ];

    const filteredProducts = products.filter((product) =>
        product.product_name.toLowerCase().includes(query.toLowerCase()) ||
        product.brand.toLowerCase().includes(query.toLowerCase()) ||
        product.model.toLowerCase().includes(query.toLowerCase())
    );

    return {
        platform: "Croma",
        query: query,
        products: filteredProducts
    };
}

module.exports = {
    searchCroma
};