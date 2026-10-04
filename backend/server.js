const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const db = require("./db");
const compareRoutes = require("./routes/compare");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", compareRoutes);

app.get("/", (req, res) => {
    res.send("Smart Khareedi Backend is Running!");
});

app.get("/api/test", (req, res) => {
    res.json({
        message: "Smart Khareedi API is working"
    });
});

app.get("/api/platforms", (req, res) => {
    db.query("SELECT * FROM platforms", (err, results) => {
        if (err) {
            console.error("Database Error:", err.message);
            return res.status(500).json({
                error: err.message
            });
        }

        res.json(results);
    });
});

app.get("/api/products", (req, res) => {
    const sql = `
        SELECT
            p.product_id,
            p.product_name,
            p.brand,
            p.model,
            p.category,
            p.image_url,
            pp.price,
            pp.product_url,
            pp.availability,
            pp.external_product_id,
            pl.platform_name
        FROM products p
        LEFT JOIN product_prices pp
            ON p.product_id = pp.product_id
        LEFT JOIN platforms pl
            ON pp.platform_id = pl.platform_id
        ORDER BY p.product_id, pp.price ASC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Database Error:", err.message);
            return res.status(500).json({
                error: err.message
            });
        }

        res.json(results);
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});