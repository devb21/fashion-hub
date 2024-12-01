// Import express and ejs
var express = require('express');
var ejs = require('ejs');

// Import mysql module
var mysql = require('mysql2');

// Import express-session for session management
var session = require('express-session');

// Create the express application object
const app = express();
const port = 8000;

// Tell Express that we want to use EJS as the templating engine
app.set('view engine', 'ejs');

// Set up the body parser
app.use(express.urlencoded({ extended: true }));

// Set up public folder (for css and static js)
app.use(express.static(__dirname + '/public'));

// Set up session management (Make sure this is above the route handlers)
app.use(
  session({
    secret: 'your-secret-key', // Replace this with a strong secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Use `true` if using HTTPS
  })
);

// Define the database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'fashion_hub_app',
  password: 'fashionyuiop',
  database: 'fashion_hub',
});

// Connect to the database
db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('Connected to database');
});

global.db = db;

// Define our application-specific data
app.locals.shopData = { shopName: 'Fashion Hub' };

// Load the route handlers
const mainRoutes = require('./routes/main');
app.use('/', mainRoutes);

// Load the route handlers for /users
const usersRoutes = require('./routes/users');
app.use('/users', usersRoutes);

// Start the web app listening
app.listen(port, () => console.log(`Node app listening on port ${port}!`));
