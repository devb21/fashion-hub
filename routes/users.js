const express = require('express');
const bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator');
const db = require('./db'); // Use the updated db.js
const router = express.Router();
const xss = require('xss'); // Anti-XSS protection
const rateLimit = require('express-rate-limit'); // Rate Limiting

const saltRounds = 10;

// Validation regex patterns
const usernameRegex = /^[A-Za-z0-9]{3,20}$/; // Username: At least 3 characters, letters, and numbers only (max 20)
const nameRegex = /^[A-Za-z]{2,25}$/; // Name: 2-25 characters, letters only
const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{5,}$/; // Password: Strong regex (uppercase, lowercase, digit, special char)


// Rate limiting for login and registration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: 'Too many attempts. Please try again later.',
});

// Route to display the login form
router.get('/login', limiter, (req, res) => {
  res.render('login.ejs', {
    errors: [],
    shopData: { shopName: 'Fashion Hub' },
    username: '',
  });
});

// Handle login form submission
router.post('/loggedin', limiter, async (req, res, next) => {
  try {
    const username = xss(req.body.username);
    const plainPassword = xss(req.body.password);

    // Check if the fields are empty
    if (!username || !plainPassword) {
      let errors = [];
      if (!username) errors.push({ msg: 'Please enter a valid username' });
      if (!plainPassword) errors.push({ msg: 'Please enter a password' });

      return res.render('login.ejs', {
        errors,
        shopData: { shopName: 'Fashion Hub' },
        username,
      });
    }

    const sqlquery = 'SELECT * FROM users WHERE username = ?';
    const [rows] = await db.query(sqlquery, [username]);

    if (rows.length === 0) {
      return res.render('login.ejs', {
        errors: [{ msg: 'Username or password is not valid' }],
        shopData: { shopName: 'Fashion Hub' },
        username,
      });
    }

    const hashedPassword = rows[0].hashedPassword;
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);

    if (isMatch) {
      const firstName = rows[0].first_name;
      const lastName = rows[0].last_name;
      req.session.user = { username, firstName, lastName };
      res.redirect('../');
    } else {
      res.render('login.ejs', {
        errors: [{ msg: 'Username or password is not valid' }],
        shopData: { shopName: 'Fashion Hub' },
        username,
      });
    }
  } catch (err) {
    next(err);
  }
});

// Logout Route
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.redirect('../');
    }
    res.redirect('../');
  });
});

// Route to display the registration form
router.get('/register', limiter, (req, res) => {
  res.render('register.ejs', {
    errors: [],
    shopData: { shopName: 'Fashion Hub' },
    username: '',
    firstname: '',
    lastname: '',
    email: '',
  });
});

// Handle registration form submission
router.post(
  '/registered',
  limiter,
  [
    check('username')
      .matches(usernameRegex)
      .withMessage('Username must be at least 3 characters long and contain only letters and numbers')
      .isLength({ max: 20 })
      .withMessage('Username must not exceed 20 characters'),
    check('firstname')
      .matches(nameRegex)
      .withMessage('First name must be at least 2 characters long and contain only letters')
      .isLength({ max: 25 })
      .withMessage('First name must not exceed 25 characters'),
    check('lastname')
      .matches(nameRegex)
      .withMessage('Last name must be at least 2 characters long and contain only letters')
      .isLength({ max: 25 })
      .withMessage('Last name must not exceed 25 characters'),
    check('email')
      .isEmail()
      .withMessage('Please enter a valid email address')
      .isLength({ max: 254 })
      .withMessage('Email must not exceed 254 characters'),
    check('password')
      .matches(passwordRegex)
      .withMessage('Password must be at least 5 characters long, contain an uppercase letter, a number, and a special character'),
    check('confirmPassword')
      .custom((value, { req }) => value === req.body.password)
      .withMessage('Passwords do not match'),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);

    // Sanitizing input fields before rendering
    req.body.username = xss(req.body.username);
    req.body.firstname = xss(req.body.firstname);
    req.body.lastname = xss(req.body.lastname);
    req.body.email = xss(req.body.email);
    req.body.password = xss(req.body.password);
    req.body.confirmPassword = xss(req.body.confirmPassword);

    // Checking for validation errors
    if (!errors.isEmpty()) {
      return res.render('register.ejs', {
        errors: errors.array(),
        shopData: { shopName: 'Fashion Hub' },
        username: req.body.username,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
      });
    }

    const plainPassword = req.body.password;
    const username = req.body.username;
    const firstName = req.body.firstname;
    const lastName = req.body.lastname;
    const email = req.body.email;

    try {
      // Check for unique username
      const sqlCheckUsername = 'SELECT username FROM users WHERE username = ?';
      const [rows] = await db.query(sqlCheckUsername, [username]);
      if (rows.length > 0) {
        return res.render('register.ejs', {
          errors: [{ msg: 'Username is already taken' }],
          shopData: { shopName: 'Fashion Hub' },
          username,
          firstname: firstName,
          lastname: lastName,
          email,
        });
      }

      // Check for unique email
      const sqlCheckEmail = 'SELECT email FROM users WHERE email = ?';
      const [emailRows] = await db.query(sqlCheckEmail, [email]);
      if (emailRows.length > 0) {
        return res.render('register.ejs', {
          errors: [{ msg: 'Email is already registered' }],
          shopData: { shopName: 'Fashion Hub' },
          username,
          firstname: firstName,
          lastname: lastName,
          email,
        });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

      // Insert the user into the database
      const sqlquery = 'INSERT INTO users (username, first_name, last_name, email, hashedPassword) VALUES (?,?,?,?,?)';
      const newUser = [username, firstName, lastName, email, hashedPassword];
      await db.query(sqlquery, newUser);

      // Store user details in session
      req.session.user = { username, firstName, lastName };

      // Redirect to the home page
      res.redirect('../');
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
