module.exports = function(app, taskData) {
    const { check, validationResult } = require('express-validator');

    const redirectLogin = (req, res, next) => {
        if (!req.session.userId ) {
          res.redirect('./login')
        } else { next (); }
    }

    app.get('/',function(req,res){
        res.render('index.ejs', taskData);
    });

    app.get('/about',redirectLogin,function(req,res) {
        res.render('about.ejs',taskData);
    });

    app.get('/register',function(req,res) {
        res.render('register.ejs',taskData);
    });

    app.post('/registered',[check('email').isEmail()], function(req,res) {
        const bcrypt = require('bcrypt');
        const saltRounds = 10;
        const plainPassword = req.body.password;

        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            res.redirect('./register'); 
        } else {
            bcrypt.hash(plainPassword,saltRounds,function(err,hashedPassword){
                if(err) {
                    return console.error(err.message);
                }
                
                let sqlquery = "INSERT INTO users (first_name,last_name,username,email,u_password) VALUES (?,?,?,?,?)";
                let newrecord = [req.body.first, req.body.last, req.body.username,req.body.email, hashedPassword];

                db.query(sqlquery,newrecord, (err, result) => {
                    if (err) {
                        return console.error(err.message);
                    }
                    else {
                        result = 'Hello '+ req.body.first + ' '+ req.body.last +' you are now registered!  We will send an email to you at ' + req.body.email;
                        result += 'Your password is: '+ req.body.password +' and your hashed password is: '+ hashedPassword;
                        res.send(result);
                    
    
                    
    
                    }
                })
                console.log(req.body);
            }) 
        }

    })

    app.get('/login',function(req,res) {
        res.render('login.ejs',taskData);
    });

    app.post('/loggedin', function(req,res) {
        const bcrypt = require('bcrypt');
        let sqlquery = "SELECT u_password FROM users WHERE username = ?";
        let user = [req.body.username];

        db.query(sqlquery,user, (err,result) => {
            if (err) {
                console.error("Database Error:", err.message);
                return res.status(500).send('Internal Server Error');
            }

            if (result.length === 0) {
                return res.status(400).send('User not found.');
            }

            const hashedPassword = result[0].u_password;

            bcrypt.compare(req.body.password, hashedPassword, function(err,isMatch){
                if (err) {
                    console.error("Bcrypt Error:", err.message);
                    return res.status(500).send('Error while comparing passwords.');
                }

                if (isMatch) {
                    req.session.userId = req.body.username;
                    res.send("Welcome " + req.body.username + "!")
                } else {
                    res.status(401).send("Incorrect Password!");
                }
            });
        })

    })

    app.get('/viewtasks',function(req,res) {
        res.render('viewTasks.ejs',taskData);
    });

    app.get('/addtasks',function(req,res){
        res.render('addTasks.ejs',taskData);
    });

    app.get('/logout', redirectLogin, (req,res) => {
        req.session.destroy(err => {
        if (err) {
          return res.redirect('./')
        }
        res.send('you are now logged out. <a href='+'./'+'>Home</a>');
        })
    })


}