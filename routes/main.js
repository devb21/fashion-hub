const express = require('express');
const router = express.Router();

router.get('/about', function (req, res) {
    res.render('about.ejs');
});

router.get('/', (req, res) => {
    const user = req.session ? req.session.user : null; // Retrieve user from session, if available

    // Query for featured products (latest products, limited to 4 items)
    const featuredQuery = 'SELECT * FROM products ORDER BY created_at DESC LIMIT 4';

    // Run the query for featured products
    db.query(featuredQuery, (err, featuredResults) => {
        if (err) {
            console.error('Error fetching featured products:', err);
            return res.status(500).send('Error retrieving featured products');
        }

        // Query to fetch latest products excluding those in the featured results
        const featuredIds = featuredResults.map(product => product.id).join(',');
        const latestQuery = featuredIds
            ? `SELECT * FROM products WHERE id NOT IN (${featuredIds}) ORDER BY created_at DESC LIMIT 4`
            : `SELECT * FROM products ORDER BY created_at DESC LIMIT 4`;

        db.query(latestQuery, (err, latestResults) => {
            if (err) {
                console.error('Error fetching latest products:', err);
                return res.status(500).send('Error retrieving latest products');
            }

            // Render the index.ejs template with data from the database
            res.render('index', {
                shopData: { shopName: 'Fashion Hub' },
                featuredProducts: featuredResults,
                latestProducts: latestResults,
                user // Pass the user to the template
            });
        });
    });
});

module.exports = router;
