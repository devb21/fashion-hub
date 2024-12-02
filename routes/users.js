const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const saltRounds = 10;

// Route to display the registration form
router.get('/register', (req, res) => {
  res.render('register.ejs');
});

// Handle registration form submission
router.post('/registered', (req, res, next) => {
  const plainPassword = req.body.password;
  const username = req.body.username;
  const firstName = req.body.firstname;
  const lastName = req.body.lastname;
  const email = req.body.email;

  bcrypt.hash(plainPassword, saltRounds, (err, hashedPassword) => {
    if (err) {
      return next(err);
    }
    const sqlquery = 'INSERT INTO users (username, first_name, last_name, email, hashedPassword) VALUES (?,?,?,?,?)';
    const newUser = [username, firstName, lastName, email, hashedPassword];
    db.query(sqlquery, newUser, (err, result) => {
      if (err) {
        return next(err);
      }
      if (!req.session) {
        return res.status(500).send('Session not initialized');
      }
      req.session.user = { username, firstName, lastName, email };
      res.redirect('../'); // Redirect to home page
    });
  });
});

// Route to display the login form
router.get('/login', (req, res) => {
  res.render('login.ejs');
});

// Handle login form submission
router.post('/loggedin', (req, res, next) => {
  const username = req.body.username;
  const plainPassword = req.body.password;

  const sqlquery = 'SELECT * FROM users WHERE username = ?';
  db.query(sqlquery, [username], (err, result) => {
    if (err) {
      return next(err);
    }
    if (result.length === 0) {
      return res.send('Login failed: User not found.');
    }

    const hashedPassword = result[0].hashedPassword;
    bcrypt.compare(plainPassword, hashedPassword, (err, isMatch) => {
      if (err) {
        return next(err);
      }
      if (isMatch) {
        const firstName = result[0].first_name;
        const lastName = result[0].last_name;
        if (!req.session) {
          return res.status(500).send('Session not initialized');
        }
        req.session.user = { username, firstName, lastName };
        res.redirect('../'); // Redirect to home page
      } else {
        res.send('Login failed: Incorrect password.');
      }
    });
  });
});

// Logout Route
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.redirect('../'); // Redirect to home page on error
    }
    res.redirect('../'); // Redirect to home page after logout
  });
});

module.exports = router;
