import { useEffect, useState } from "react";
import "./App.css";

function App() {
    const [search, setSearch] = useState("");
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searched, setSearched] = useState(false);

    useEffect(() => {
        loadAllProducts();
    }, []);

    const loadAllProducts = async () => {
        setLoading(true);

        try {
            const response = await fetch(
                "http://localhost:5000/api/products"
            );

            const data = await response.json();

            if (response.ok) {
                setProducts(data.products || []);
            } else {
                setProducts([]);
            }
        } catch (error) {
            console.error("Error loading products:", error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!search.trim()) {
            loadAllProducts();
            setSearched(false);
            return;
        }

        setLoading(true);
        setSearched(true);

        try {
            const response = await fetch(
                `http://localhost:5000/api/compare?query=${encodeURIComponent(search)}`
            );

            const data = await response.json();

            if (response.ok) {
                setProducts(data.products || []);
            } else {
                setProducts([]);
            }
        } catch (error) {
            console.error("Search error:", error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === "Enter") {
            handleSearch();
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }).format(price);
    };

    return (
        <div className="app">

            <header className="header">
                <div className="container header-content">
                    <div className="logo">
                        <span>Smart</span> Khareedi
                    </div>

                    <div className="header-tagline">
                        Compare. Save. Shop Smart.
                    </div>
                </div>
            </header>

            <main>

                <section className="hero">
                    <div className="container hero-content">

                        <h1>Find the Best Smartphone Price</h1>

                        <p>
                            Compare smartphone prices across Amazon, Flipkart,
                            Vijay Sales and Croma.
                        </p>

                        <div className="search-box">

                            <input
                                type="text"
                                placeholder="Search smartphone e.g. Samsung, iPhone, OnePlus..."
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                onKeyDown={handleKeyDown}
                            />

                            <button onClick={handleSearch}>
                                Search
                            </button>

                        </div>

                    </div>
                </section>

                <section className="results-section">
                    <div className="container">

                        {loading && (
                            <div className="status-message">
                                Loading smartphones...
                            </div>
                        )}

                        {!loading && searched && products.length === 0 && (
                            <div className="status-message">
                                No smartphones found. Try another search.
                            </div>
                        )}

                        {!loading && products.length > 0 && (
                            <>
                                <div className="results-header">
                                    <h2>
                                        {searched
                                            ? "Search Results"
                                            : "All Smartphones"}
                                    </h2>

                                    <p>
                                        {products.length} smartphone
                                        {products.length > 1 ? "s" : ""} found
                                    </p>
                                </div>

                                <div className="products-container">

                                    {products.map((product) => (

                                        <div
                                            className="product-card"
                                            key={product.product_id}
                                        >

                                            <div className="product-info">

                                                <div className="product-image">

                                                    {product.image_url ? (
                                                        <img
                                                            src={product.image_url}
                                                            alt={product.product_name}
                                                        />
                                                    ) : (
                                                        <div className="phone-placeholder">
                                                            📱
                                                        </div>
                                                    )}

                                                </div>

                                                <div className="product-details">

                                                    <span className="brand">
                                                        {product.brand}
                                                    </span>

                                                    <h3>
                                                        {product.product_name}
                                                    </h3>

                                                    <p>
                                                        {product.description}
                                                    </p>

                                                </div>

                                            </div>

                                            {product.variants.map((variant) => (

                                                <div
                                                    className="variant-section"
                                                    key={variant.variant_id}
                                                >

                                                    <div className="variant-title">
                                                        <strong>
                                                            {variant.variant_name}
                                                        </strong>

                                                        <span>
                                                            Lowest:{" "}
                                                            {variant.lowest_price
                                                                ? formatPrice(
                                                                    variant.lowest_price
                                                                )
                                                                : "Not Available"}
                                                        </span>
                                                    </div>

                                                    <div className="price-list">

                                                        {variant.prices.map(
                                                            (price) => (

                                                                <div
                                                                    className={
                                                                        price.lowest_price
                                                                            ? "price-row lowest"
                                                                            : "price-row"
                                                                    }
                                                                    key={
                                                                        price.platform_id
                                                                    }
                                                                >

                                                                    <div className="platform-info">

                                                                        <strong>
                                                                            {price.platform}
                                                                        </strong>

                                                                        {price.lowest_price && (
                                                                            <span className="lowest-badge">
                                                                                LOWEST PRICE
                                                                            </span>
                                                                        )}

                                                                    </div>

                                                                    <div className="price-info">

                                                                        <strong className="price">
                                                                            {formatPrice(
                                                                                price.price
                                                                            )}
                                                                        </strong>

                                                                        <a
                                                                            href={
                                                                                price.product_url
                                                                            }
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="buy-button"
                                                                        >
                                                                            Buy Now
                                                                        </a>

                                                                    </div>

                                                                </div>

                                                            )
                                                        )}

                                                    </div>

                                                </div>

                                            ))}

                                        </div>

                                    ))}

                                </div>
                            </>
                        )}

                    </div>
                </section>

            </main>

            <footer className="footer">
                <div className="container">
                    <p>
                        © 2026 Smart Khareedi. Compare prices and shop smarter.
                    </p>
                </div>
            </footer>

        </div>
    );
}

export default App;