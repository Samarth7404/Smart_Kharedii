jsx
import { useEffect, useState } from "react";
import "./App.css";

function App() {
    const [search, setSearch] = useState("");
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searched, setSearched] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        loadAllProducts();
    }, []);

    // Load all smartphones
    const loadAllProducts = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await fetch(
                "http://localhost:5000/api/products"
            );

            if (!response.ok) {
                throw new Error("Unable to load products.");
            }

            const data = await response.json();

            setProducts(
                (data.products || []).map((product) => ({
                    ...product,
                    variants: product.variants || []
                }))
            );
        } catch (err) {
            console.error("Error loading products:", err);
            setProducts([]);
            setError(
                "Unable to connect to the server. Please make sure your backend is running."
            );
        } finally {
            setLoading(false);
        }
    };

    // Search smartphones
    const handleSearch = async () => {
        if (!search.trim()) {
            setSearched(false);
            loadAllProducts();
            return;
        }

        setLoading(true);
        setSearched(true);
        setError("");

        try {
            const response = await fetch(
                `http://localhost:5000/api/compare?query=${encodeURIComponent(
                    search.trim()
                )}`
            );

            if (!response.ok) {
                throw new Error("Search request failed.");
            }

            const data = await response.json();

            setProducts(
                (data.products || []).map((product) => ({
                    ...product,
                    variants: product.variants || []
                }))
            );
        } catch (err) {
            console.error("Search error:", err);
            setProducts([]);
            setError("Unable to search right now. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Search when Enter is pressed
    const handleKeyDown = (event) => {
        if (event.key === "Enter") {
            handleSearch();
        }
    };

    // Format prices in Indian rupees
    const formatPrice = (price) => {
        if (price === null || price === undefined || price === "") {
            return "Not Available";
        }

        const numericPrice = Number(price);

        if (!Number.isFinite(numericPrice)) {
            return "Not Available";
        }

        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }).format(numericPrice);
    };

    // Handle missing or broken product images
    const handleImageError = (event) => {
        const image = event.currentTarget;

        // Prevent an endless image-error loop
        image.onerror = null;
        image.style.display = "none";

        const fallback = image.nextElementSibling;

        if (fallback) {
            fallback.style.display = "flex";
        }
    };

    return (
        <div className="app">

            {/* HEADER */}
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

                {/* HERO SECTION */}
                <section className="hero">
                    <div className="container hero-content">

                        <h1>Find the Best Smartphone Price</h1>

                        <p>
                            Compare smartphone prices across Amazon,
                            Flipkart, Vijay Sales and Croma.
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
                                aria-label="Search smartphones"
                            />

                            <button
                                type="button"
                                onClick={handleSearch}
                            >
                                Search
                            </button>

                        </div>

                    </div>
                </section>

                {/* RESULTS SECTION */}
                <section className="results-section">
                    <div className="container">

                        {/* Loading */}
                        {loading && (
                            <div className="status-message">
                                Loading smartphones...
                            </div>
                        )}

                        {/* Server error */}
                        {!loading && error && (
                            <div className="status-message error-message">
                                <p>{error}</p>

                                <button
                                    type="button"
                                    className="retry-button"
                                    onClick={
                                        searched
                                            ? handleSearch
                                            : loadAllProducts
                                    }
                                >
                                    Try Again
                                </button>
                            </div>
                        )}

                        {/* No products found */}
                        {!loading &&
                            !error &&
                            products.length === 0 && (
                                <div className="status-message">
                                    {searched
                                        ? "No smartphones found. Try another search."
                                        : "No smartphones are available right now."}
                                </div>
                            )}

                        {/* Product results */}
                        {!loading &&
                            !error &&
                            products.length > 0 && (
                                <>

                                    <div className="results-header">

                                        <h2>
                                            {searched
                                                ? "Search Results"
                                                : "All Smartphones"}
                                        </h2>

                                        <p>
                                            {products.length} smartphone
                                            {products.length !== 1
                                                ? "s"
                                                : ""}{" "}
                                            found
                                        </p>

                                    </div>

                                    <div className="products-container">

                                        {products.map((product, index) => (

                                            <article
                                                className="product-card"
                                                key={
                                                    product.product_id ??
                                                    product.id ??
                                                    index
                                                }
                                            >

                                                {/* PRODUCT INFORMATION */}
                                                <div className="product-info">

                                                    {/* PRODUCT IMAGE */}
                                                    <div className="product-image">

                                                        {product.image_url && (
                                                            <img
                                                                src={product.image_url}
                                                                alt={
                                                                    product.product_name ||
                                                                    "Smartphone"
                                                                }
                                                                loading="lazy"
                                                                onError={
                                                                    handleImageError
                                                                }
                                                            />
                                                        )}

                                                        {/* Displayed if image URL is missing or broken */}
                                                        <div
                                                            className="image-fallback"
                                                            style={{
                                                                display: product.image_url
                                                                    ? "none"
                                                                    : "flex"
                                                            }}
                                                        >
                                                            <span>
                                                                {product.brand ||
                                                                    "Smartphone"}
                                                            </span>

                                                            <small>
                                                                Image unavailable
                                                            </small>
                                                        </div>

                                                    </div>

                                                    {/* PRODUCT DETAILS */}
                                                    <div className="product-details">

                                                        {product.brand && (
                                                            <span className="brand">
                                                                {product.brand}
                                                            </span>
                                                        )}

                                                        <h3>
                                                            {product.product_name}
                                                        </h3>

                                                        {product.description && (
                                                            <p>
                                                                {product.description}
                                                            </p>
                                                        )}

                                                    </div>

                                                </div>

                                                {/* VARIANTS AND PRICES */}
                                                {product.variants.map(
                                                    (variant, variantIndex) => (

                                                        <div
                                                            className="variant-section"
                                                            key={
                                                                variant.variant_id ??
                                                                variantIndex
                                                            }
                                                        >

                                                            {/* Variant name is hidden, lowest price remains visible */}
                                                            <div className="variant-title">

                                                                <strong>
                                                                    {variant.variant_name}
                                                                </strong>

                                                                <span>
                                                                    Lowest:{" "}
                                                                    {variant.lowest_price !==
                                                                        null &&
                                                                    variant.lowest_price !==
                                                                        undefined
                                                                        ? formatPrice(
                                                                            variant.lowest_price
                                                                        )
                                                                        : "Not Available"}
                                                                </span>

                                                            </div>

                                                            <div className="price-list">

                                                                {(variant.prices || []).map(
                                                                    (
                                                                        price,
                                                                        priceIndex
                                                                    ) => (

                                                                        <div
                                                                            className={
                                                                                price.lowest_price
                                                                                    ? "price-row lowest"
                                                                                    : "price-row"
                                                                            }
                                                                            key={
                                                                                price.platform_id ??
                                                                                priceIndex
                                                                            }
                                                                        >

                                                                            {/* STORE NAME */}
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

                                                                            {/* PRICE AND BUY BUTTON */}
                                                                            <div className="price-info">

                                                                                <strong className="price">
                                                                                    {formatPrice(
                                                                                        price.price
                                                                                    )}
                                                                                </strong>

                                                                                {price.product_url ? (
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
                                                                                ) : (
                                                                                    <span className="unavailable-button">
                                                                                        Link Unavailable
                                                                                    </span>
                                                                                )}

                                                                            </div>

                                                                        </div>

                                                                    )
                                                                )}

                                                            </div>

                                                        </div>

                                                    )
                                                )}

                                            </article>

                                        ))}

                                    </div>

                                </>
                            )}

                    </div>
                </section>

            </main>

            {/* FOOTER */}
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
