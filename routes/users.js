const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const saltRounds = 10;


const { check, validationResult } = require('express-validator')


// Route to display the registration form
router.get('/register', (req, res) => {
  res.render('register.ejs');
});

// Handle registration form submission
router.post('/registered', [check('email').isEmail()], (req, res, next) => {
 const errors = validationResult(req);
 if(!errors.isEmpty()) {
    res.redirect('./register');
 } else {
 }
  const plainPassword = req.body.password;
  const username = req.body.username;
  const firstName = req.body.firstname;
  const lastName = req.body.lastname;
  const email = req.body.email;


  bcrypt.hash(plainPassword, saltRounds, (err, hashedPassword) => {
    if (err) {
      return next(err);
    }
    let sqlquery = 'INSERT INTO users (username, first_name, last_name, email, hashedPassword) VALUES (?,?,?,?,?)';
    let newUser = [username, firstName, lastName, email, hashedPassword];
    db.query(sqlquery, newUser, (err, result) => {
      if (err) {
        return next(err);
      }
      // Ensure session object exists before setting it
      if (!req.session) {
        return res.status(500).send('Session not initialized');
      }
      req.session.user = { username, firstName, lastName, email };
      res.redirect('../'); // Redirect to home page (should be /)
    });
  });
});





// Route to display the login form
router.get('/login', (req, res) => {
  res.render('login.ejs', {
    errors: [], // Ensure that 'errors' is defined as an empty array
    shopData: { shopName: 'Fashion Hub' },
    username: '' // Pass an empty string if no username is available
  });
});



// Handle login form submission
router.post('/loggedin', [
  check('username').notEmpty().withMessage('Username is required'),
  check('password').notEmpty().withMessage('Password is required')
], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('login.ejs', {
      errors: errors.array(),
      shopData: { shopName: 'Fashion Hub' },
      username: req.body.username || '',  // Retain username
      // Do not retain password for security reasons
    });
  }

  const username = req.body.username;
  const plainPassword = req.body.password;

  let sqlquery = 'SELECT * FROM users WHERE username = ?';
  db.query(sqlquery, [username], (err, result) => {
    if (err) {
      return next(err);
    }
    if (result.length === 0) {
      return res.render('login.ejs', {
        errors: [{ msg: 'Login failed: User not found.' }],
        shopData: { shopName: 'Fashion Hub' },
        username: req.body.username || '', // Retain the username entered
        // Do not retain password
      });
    }

    const hashedPassword = result[0].hashedPassword;
    bcrypt.compare(plainPassword, hashedPassword, (err, isMatch) => {
      if (err) {
        return next(err);
      }
      if (isMatch) {
        const firstName = result[0].first_name;
        const lastName = result[0].last_name;
        req.session.user = { username, firstName, lastName };
        res.redirect('../');
      } else {
        res.render('login.ejs', {
          errors: [{ msg: 'Login failed: Incorrect password.' }],
          shopData: { shopName: 'Fashion Hub' },
          username: req.body.username || '', // Retain the username entered
          // Do not retain password for security reasons
        });
      }
    });
  });
});

// Logout Route
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.redirect('../'); // Redirect back to home page on error
    }
    res.redirect('../'); // Redirect to home page after logout
  });
});

module.exports = router;
