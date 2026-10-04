import { useState } from "react";
import "./App.css";

function App() {
    const [search, setSearch] = useState("");
    const [products, setProducts] = useState([]);
    const [lowestPrice, setLowestPrice] = useState(null);
    const [lowestPlatform, setLowestPlatform] = useState("");
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const searchProducts = async () => {
        if (!search.trim()) {
            return;
        }

        setLoading(true);
        setSearched(true);

        try {
            const response = await fetch(
                `http://localhost:5000/api/compare?query=${encodeURIComponent(search)}`
            );

            const data = await response.json();

            setProducts(data.products || []);
            setLowestPrice(data.lowest_price);
            setLowestPlatform(data.lowest_platform || "");
        } catch (error) {
            console.error("Error:", error);
            setProducts([]);
            setLowestPrice(null);
            setLowestPlatform("");
        }

        setLoading(false);
    };

    const handleKeyDown = (event) => {
        if (event.key === "Enter") {
            searchProducts();
        }
    };

    return (
        <div className="app">

            <header className="header">
                <div className="logo">Smart Khareedi</div>
                <div className="tagline">Compare. Choose. Save.</div>
            </header>

            <main>

                <section className="hero">
                    <h1>Compare Smartphone Prices</h1>

                    <p>
                        Find the lowest price across Amazon, Flipkart,
                        Vijay Sales and Croma.
                    </p>

                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="Search smartphone..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />

                        <button onClick={searchProducts}>
                            Search
                        </button>
                    </div>
                </section>

                <section className="products">

                    {loading && (
                        <h2>Searching products...</h2>
                    )}

                    {!loading && searched && products.length === 0 && (
                        <h2>No smartphones found</h2>
                    )}

                    {!loading && products.length > 0 && (
                        <>
                            <div className="comparison-summary">
                                <h2>
                                    Lowest Price: ₹
                                    {lowestPrice.toLocaleString("en-IN")}
                                </h2>

                                <p>
                                    Available at {lowestPlatform}
                                </p>
                            </div>

                            <div className="product-card">

                                <div className="product-info">
                                    <h2>
                                        {products[0].product_name}
                                    </h2>

                                    <p>
                                        {products[0].brand} •{" "}
                                        {products[0].model}
                                    </p>

                                    <p>
                                        Variant:{" "}
                                        {products[0].variant}
                                    </p>
                                </div>

                                <div className="price-list">

                                    {products.map((product, index) => (

                                        <div
                                            className={`price-row ${
                                                product.lowest_price
                                                    ? "lowest"
                                                    : ""
                                            }`}
                                            key={index}
                                        >

                                            <div>
                                                <strong>
                                                    {product.platform}
                                                </strong>

                                                {product.lowest_price && (
                                                    <span className="lowest-badge">
                                                        LOWEST PRICE
                                                    </span>
                                                )}
                                            </div>

                                            <div className="price">
                                                ₹
                                                {product.price.toLocaleString(
                                                    "en-IN"
                                                )}
                                            </div>

                                            <a
                                                href={product.product_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="buy-button"
                                            >
                                                Buy Now
                                            </a>

                                        </div>

                                    ))}

                                </div>

                            </div>
                        </>
                    )}

                </section>

            </main>

            <footer>
                <p>© 2026 Smart Khareedi</p>
            </footer>

        </div>
    );
}

export default App;