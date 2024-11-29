// Import express and ejs
var express = require ('express')
var ejs = require('ejs')

//Import mysql module
var mysql = require('mysql2')


// Create the express application object
const app = express()
const port = 8000

// Tell Express that we want to use EJS as the templating engine
app.set('view engine', 'ejs')

// Set up the body parser 
app.use(express.urlencoded({ extended: true }))

// Set up public folder (for css and statis js)
app.use(express.static(__dirname + '/public'))

// Define the database connection
const db = mysql.createConnection ({
    host: 'localhost',
    user: 'fashion_hub_app',
    password: 'fashionyuiop',
    database: 'fashion_hub'
})
// Connect to the database
db.connect((err) => {
    if (err) {
        throw err
    }
    console.log('Connected to database')
})
global.db = db

// Define our application-specific data
app.locals.shopData = {shopName: "Fashion Hub"}

// Load the route handlers
const mainRoutes = require("./routes/main")
app.use('/', mainRoutes)


// Main Route: Home
app.get('/', (req, res) => {
    // Query to fetch featured products
    const featuredQuery = 'SELECT * FROM products WHERE is_featured = 1 LIMIT 4';
    
    db.query(featuredQuery, (err, featuredProducts) => {
      if (err) {
        console.error('Error fetching featured products:', err);
        return res.status(500).send('Error fetching featured products');
      }
  
      // Query to fetch latest products (ignoring featured products)
      const latestQuery = 'SELECT * FROM products WHERE is_featured = 0 ORDER BY created_at DESC LIMIT 4';
      
      db.query(latestQuery, (err, latestProducts) => {
        if (err) {
          console.error('Error fetching latest products:', err);
          return res.status(500).send('Error fetching latest products');
        }
  
        // Render the index page with both featured and latest products
        res.render('index', {
          user: req.session.user, // Pass session user data to the view
          featuredProducts: featuredProducts, // Pass featured products to the view
          latestProducts: latestProducts // Pass latest products to the view
        });
      });
    });
  });
  
// Start the web app listening
app.listen(port, () => console.log(`Node app listening on port ${port}!`))