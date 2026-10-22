import { useEffect, useState } from "react";
import "./App.css";

function App() {
    const [search, setSearch] = useState("");
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searched, setSearched] = useState(false);
    const [error, setError] = useState("");

    const getPhoneImage = (productName = "") => {
        const name = productName.toLowerCase();

        if (name.includes("samsung galaxy s25 ultra")) return "/images/samsung-galaxy-s25-ultra.jpg";
        if (name.includes("samsung galaxy s25")) return "/images/samsung-galaxy-s25.jpg";
        if (name.includes("iphone 17")) return "/images/iphone-17.jpg";
        if (name.includes("iphone 16")) return "/images/iphone-16.jpg";
        if (name.includes("oneplus 13r")) return "/images/oneplus-13r.jpg";
        if (name.includes("oneplus 13")) return "/images/oneplus-13.jpg";
        if (name.includes("google pixel 9") || name.includes("pixel 9")) return "/images/google-pixel-9.jpg";
        if (name.includes("xiaomi 15")) return "/images/xiaomi-15.jpg";
        if (name.includes("vivo x200")) return "/images/vivo-x200.jpg";
        if (name.includes("nothing phone 3")) return "/images/nothing-phone-3.jpg";

        return "";
    };

    const getImageUrl = (product) => {
        return (
            getPhoneImage(product.product_name || product.name || "") ||
            product.image_url ||
            product.image ||
            ""
        );
    };

    useEffect(() => {
        loadAllProducts();
    }, []);

    const loadAllProducts = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await fetch("http://localhost:5000/api/products");

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
            setError("Unable to connect to the server. Please make sure your backend is running.");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (query = search) => {
        if (!query.trim()) {
            setSearch("");
            setSearched(false);
            await loadAllProducts();
            return;
        }

        setSearch(query);
        setSearched(true);
        setLoading(true);
        setError("");

        try {
            const response = await fetch(
                `http://localhost:5000/api/compare?query=${encodeURIComponent(query.trim())}`
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

    const handleKeyDown = (event) => {
        if (event.key === "Enter") {
            handleSearch();
        }
    };

    const formatPrice = (price) => {
        if (price === null || price === undefined || price === "") {
            return "Price unavailable";
        }

        const numericPrice = Number(price);

        if (!Number.isFinite(numericPrice)) {
            return "Price unavailable";
        }

        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }).format(numericPrice);
    };

    const getProductName = (product) => {
        return product.product_name || product.name || "Smartphone";
    };

    const getRetailers = (product) => {
        if (Array.isArray(product.retailers)) {
            return product.retailers;
        }

        if (Array.isArray(product.stores)) {
            return product.stores;
        }

        if (Array.isArray(product.variants)) {
            return product.variants.flatMap((variant) =>
                Array.isArray(variant.prices)
                    ? variant.prices.map((price) => ({
                        ...price,
                        retailer_name: price.platform || price.retailer_name || price.store_name || price.name,
                        price: price.price ?? price.selling_price ?? price.current_price,
                        product_url: price.product_url || price.url || price.link || price.buy_link
                    }))
                    : []
            );
        }

        return [];
    };

    const getRetailerName = (retailer) => {
        return (
            retailer.retailer_name ||
            retailer.platform ||
            retailer.store_name ||
            retailer.name ||
            "Online Store"
        );
    };

    const getRetailerPrice = (retailer) => {
        return (
            retailer.price ??
            retailer.selling_price ??
            retailer.current_price ??
            null
        );
    };

    const getRetailerLink = (retailer) => {
        const value =
            retailer.product_url ||
            retailer.url ||
            retailer.link ||
            retailer.buy_link ||
            "";

        const retailerName = getRetailerName(retailer).toLowerCase();

        const storeHomepages = {
            amazon: "https://www.amazon.in/",
            flipkart: "https://www.flipkart.com/",
            croma: "https://www.croma.com/",
            "vijay sales": "https://www.vijaysales.com/"
        };

        const getHomepage = () => {
            const store = Object.keys(storeHomepages).find((name) =>
                retailerName.includes(name)
            );

            return store ? storeHomepages[store] : "";
        };

        if (!value) {
            return getHomepage();
        }

        try {
            const url = new URL(value);
            const host = url.hostname.toLowerCase();

            const allowedDomains = [
                "amazon.in",
                "amzn.in",
                "flipkart.com",
                "croma.com",
                "vijaysales.com"
            ];

            const isAllowed = allowedDomains.some(
                (domain) =>
                    host === domain || host.endsWith("." + domain)
            );

            if (url.protocol !== "https:" || !isAllowed) {
                return getHomepage();
            }

            if (url.pathname === "/" && !url.search && !url.hash) {
                return getHomepage() || url.href;
            }

            return url.href;
        } catch {
            return getHomepage();
        }
    };

    const getStartingPrice = (product) => {
        return (
            product.min_price ??
            product.lowest_price ??
            product.price ??
            null
        );
    };

    return (
        <div className="app">
            <header className="header">
                <div className="header-content">
                    <a
                        href="/"
                        className="logo"
                        onClick={(event) => {
                            event.preventDefault();
                            setSearch("");
                            setSearched(false);
                            loadAllProducts();
                        }}
                    >
                        <span>🛍️ Smart Khareedi</span>
                    </a>

                    <p className="tagline">Compare prices. Shop smarter.</p>
                </div>
            </header>

            <section className="hero">
                <div className="hero-content">
                    <h1>Find the Best Deal on Your Next Phone</h1>
                    <p>Compare smartphone prices and find the best deal for your budget.</p>

                    <div className="search-box">
                        <input
                            type="text"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Search for a smartphone..."
                            aria-label="Search smartphones"
                        />

                        <button
                            type="button"
                            onClick={() => handleSearch()}
                            disabled={loading}
                        >
                            Search
                        </button>
                    </div>
                </div>
            </section>

            <main className="results-section">
                <div className="container">
                    <div className="results-header">
                        <h2>{searched ? "Search Results" : "All Smartphones"}</h2>

                        <p>
                            {searched
                                ? `Showing results for "${search}"`
                                : `${products.length} smartphones found`}
                        </p>

                        {searched && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearch("");
                                    setSearched(false);
                                    loadAllProducts();
                                }}
                                style={{
                                    marginTop: "12px",
                                    padding: "9px 16px",
                                    border: "none",
                                    borderRadius: "7px",
                                    background: "#2563eb",
                                    color: "white",
                                    cursor: "pointer"
                                }}
                            >
                                Show All Phones
                            </button>
                        )}
                    </div>

                    {loading && (
                        <div className="status-message">Loading smartphones...</div>
                    )}

                    {!loading && error && (
                        <div className="status-message error-message">
                            <p>{error}</p>

                            <button
                                className="retry-button"
                                type="button"
                                onClick={() => {
                                    if (searched && search.trim()) {
                                        handleSearch();
                                    } else {
                                        loadAllProducts();
                                    }
                                }}
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    {!loading && !error && products.length === 0 && (
                        <div className="status-message">
                            No smartphones found. Try another search.
                        </div>
                    )}

                    {!loading && products.length > 0 && (
                        <div className="products-container">
                            {products.map((product, index) => {
                                const productName = getProductName(product);
                                const retailers = getRetailers(product);
                                const imageUrl = getImageUrl(product);

                                const prices = retailers
                                    .map((retailer) => Number(getRetailerPrice(retailer)))
                                    .filter((price) => Number.isFinite(price) && price > 0);

                                const lowestPrice = prices.length > 0 ? Math.min(...prices) : null;

                                return (
                                    <article
                                        className="product-card"
                                        key={product.product_id || product.id || `${productName}-${index}`}
                                    >
                                        <div className="product-info">
                                            <div className="product-image">
                                                {imageUrl && (
                                                    <img
                                                        src={imageUrl}
                                                        alt={productName}
                                                        loading="lazy"
                                                        onError={(event) => {
                                                            const img = event.currentTarget;
                                                            img.onerror = null;
                                                            img.style.display = "none";

                                                            const fallback = img.parentElement.querySelector(".image-fallback");

                                                            if (fallback) {
                                                                fallback.style.display = "flex";
                                                            }
                                                        }}
                                                    />
                                                )}

                                                <div
                                                    className="image-fallback"
                                                    style={{ display: imageUrl ? "none" : "flex" }}
                                                >
                                                    <span>📱</span>
                                                    <strong>{productName}</strong>
                                                    <small>Image unavailable</small>
                                                </div>
                                            </div>

                                            <div className="product-details">
                                                {product.brand && (
                                                    <span className="brand">{product.brand}</span>
                                                )}

                                                <h3>{productName}</h3>

                                                {product.description && <p>{product.description}</p>}

                                                {lowestPrice !== null && (
                                                    <p>
                                                        <strong>Lowest Price: </strong>
                                                        {formatPrice(lowestPrice)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="variant-section">
                                            <div className="variant-title">
                                                <span>Compare Retailers</span>
                                            </div>

                                            <div className="price-list">
                                                {retailers.length > 0 ? (
                                                    retailers.map((retailer, retailerIndex) => {
                                                        const price = getRetailerPrice(retailer);
                                                        const numericPrice = Number(price);

                                                        const isLowest =
                                                            lowestPrice !== null &&
                                                            Number.isFinite(numericPrice) &&
                                                            numericPrice === lowestPrice;

                                                        const retailerLink = getRetailerLink(retailer);

                                                        return (
                                                            <div
                                                                className={`price-row ${isLowest ? "lowest" : ""}`}
                                                                key={retailer.retailer_id || retailer.id || retailerIndex}
                                                            >
                                                                <div className="platform-info">
                                                                    <strong>{getRetailerName(retailer)}</strong>

                                                                    {isLowest && (
                                                                        <span className="lowest-badge">
                                                                            LOWEST PRICE
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                <div className="price-info">
                                                                    <span className="price">{formatPrice(price)}</span>

                                                                    {retailerLink ? (
                                                                        <a
                                                                            className="buy-button"
                                                                            href={retailerLink}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                        >
                                                                            Buy Now
                                                                        </a>
                                                                    ) : (
                                                                        <span className="unavailable-button">
                                                                            Link unavailable
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                ) : (
                                                    <p>No retailer prices available for this product.</p>
                                                )}
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>

            <footer className="footer">
                <p>
                    © {new Date().getFullYear()} Smart Khareedi. Compare prices. Shop smarter.
                </p>
            </footer>
        </div>
    );
}

export default App;
