module.exports = function(app, taskData) {
    const { check, validationResult } = require('express-validator');

    const redirectLogin = (req, res, next) => {
        if (!req.session.userId ) {
          res.redirect('./login')
        } else { next (); }
    }
    app.use(function (req, res, next) {
        res.locals.session = req.session;
        next();
    });


    

    app.get('/', function(req, res) {
        const data = {
            ...taskData,
            username: req.session.userId || null
        };
        res.render('index.ejs',data)
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
                        res.redirect('/')
                    
    
                    
    
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
        let sqlquery = "SELECT u_password, user_id FROM users WHERE username = ?";
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
                    req.session.userDbId = result[0].user_id;
                    console.log('user_id: ' + req.session.userDbId)
                    res.redirect('/');
                } else {
                    res.status(401).send("Incorrect Password!");
                }
            });
        })

    })

    app.get('/viewtasks', redirectLogin, function(req, res) {
        const loggedInUserId = req.session.userDbId; // Retrieve the logged-in user's ID from the session
    
        // Query to get tasks for the logged-in user
        const getTasksQuery = 'SELECT * FROM tasks WHERE user_id = ?';
        db.query(getTasksQuery, [loggedInUserId], (err, tasks) => {
            if (err) {
                console.error('Error fetching tasks:', err);
                return res.status(500).send('Error fetching tasks');
            }
    
            // Now 'tasks' contains only the tasks created by the logged-in user
            // Render these tasks in your view
            res.render('viewTasks.ejs', { tasks: tasks });
        });
    });
    

    app.get('/addtasks',function(req,res){
        res.render('addTasks.ejs',taskData);
    });

    app.post('/addedtask', function(req, res) {
        // Inserting a new course
        const insertCourseQuery = 'INSERT INTO courses (course_name) VALUES (?)';
        db.query(insertCourseQuery, [req.body.course], (err, courseResult) => {
            if (err) {
                console.error('Error adding course:', err);
                return res.status(500).send('Error adding course');
            }
    
            const courseId = courseResult.insertId; // Get the ID of the newly inserted course
    
            // Now insert the task with the course_id
            const insertTaskQuery = 'INSERT INTO tasks (user_id,course_id, task_name, due_date, start_time, end_time, priority, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
            db.query(insertTaskQuery, [req.session.userDbId,courseId, req.body.taskName, req.body.dueDate, req.body.startTime, req.body.endTime, req.body.priority, req.body.status], (err, taskResult) => {
                if (err) {
                    console.error('Error adding task:', err);
                    return res.status(500).send('Error adding task');
                }
                res.redirect('/viewtasks'); // Redirect to the view tasks page or another appropriate page
            });
        });
    });
    
    

    app.get('/logout', redirectLogin, (req,res) => {
        req.session.destroy(err => {
        if (err) {
          return res.redirect('/')
        }
        res.redirect('/')
        })
    })


}