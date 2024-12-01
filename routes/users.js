// Create a new router
const express = require("express")
const router = express.Router()

// Include bcrypt
const bcrypt = require('bcrypt');
const saltRounds = 10;

router.get('/register', function (req, res, next) {
    res.render('register.ejs');
});

router.post('/registered', function (req, res, next) {
    const plainPassword = req.body.password;
    const username = req.body.username;
    const firstName = req.body.firstname;
    const lastName = req.body.lastname;
    const email = req.body.email;

    bcrypt.hash(plainPassword, saltRounds, function (err, hashedPassword) {
        if (err) {
            return next(err);  // Handle error properly
        }

        let sqlquery = "INSERT INTO users (username, first_name, last_name, email, hashedPassword) VALUES (?,?,?,?,?)";
        let newUser = [username, firstName, lastName, email, hashedPassword];

        db.query(sqlquery, newUser, (err, result) => {
            if (err) {
                return next(err);  // Handle error if something goes wrong
            }

            let resultMessage = 'Hello ' + firstName + ' ' + lastName +
                ', you are now registered! We will send an email to you at ' + email;
            resultMessage;

            res.send(resultMessage);
        });  // Close db.query callback
    });  // Close bcrypt.hash callback
});  // Close router.post callback



// Route to display the login form
router.get('/login', function(req, res, next) {
    res.render('login.ejs');
});

// Route to handle login form submission
router.post('/loggedin', function(req, res, next) {
    const username = req.body.username;
    const plainPassword = req.body.password;

    // Query the database to find the user by username
    let sqlquery = "SELECT * FROM users WHERE username = ?";
    db.query(sqlquery, [username], (err, result) => {
        if (err) {
            return next(err);  // Handle error properly
        }
        if (result.length === 0) {
            // No user found with this username
            return res.send('Login failed: User not found.');
        }

        // Compare the password
        const hashedPassword = result[0].hashedPassword;
        bcrypt.compare(plainPassword, hashedPassword, (err, isMatch) => {
            if (err) {
                return next(err);  // Handle error properly
            }
            if (isMatch) {
                // Password matches
                const firstName = result[0].first_name;
                const lastName = result[0].last_name;
                let resultMessage = 'Hello ' + firstName + ' ' + lastName +
                    ', you have successfully logged in!';
                    res.redirect('/');
            } else {
                // Password does not match
                res.send('Login failed: Incorrect password.');
            }
        });
    });
});


// Logout route
/*router.get('/logout', redirectLogin, (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('./');
        }
        res.send('you are now logged out. <a href='+'/'+'>Home</a>');
    });
});
*/


// Export the router object so index.js can access it
module.exports = router