async function searchVijaySales(query) {
    const products = [
        {
            product_name: "Apple iPhone 17",
            brand: "Apple",
            model: "iPhone 17",
            variant: "8GB RAM / 128GB",
            price: 80990,
            currency: "INR",
            availability: "Available",
            product_url: "https://www.vijaysales.com/",
            image_url: ""
        }
    ];

    const filteredProducts = products.filter((product) =>
        product.product_name.toLowerCase().includes(query.toLowerCase()) ||
        product.brand.toLowerCase().includes(query.toLowerCase()) ||
        product.model.toLowerCase().includes(query.toLowerCase())
    );

    return {
        platform: "Vijay Sales",
        query: query,
        products: filteredProducts
    };
}

module.exports = {
    searchVijaySales
};