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
                        res.redirect('./')
                    
    
                    
    
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
                    res.redirect('/viewtasks');
                } else {
                    res.status(401).send("Incorrect Password!");
                }
            });
        })

    })

    app.get('/viewtasks', redirectLogin, function(req, res) {
        const loggedInUserId = req.session.userDbId; // Retrieve the logged-in user's ID from the session
    
        // Using the stored procedure
        const callProcedure = 'CALL GetTasksForUser(?)';
        db.query(callProcedure, [loggedInUserId], (err, results) => {
            if (err) {
                console.error('Error fetching tasks:', err);
                return res.status(500).send('Error fetching tasks');
            }
            res.render('viewtasks.ejs', { tasks: results[0] });
        });
    });
    
    

    app.get('/addtasks',redirectLogin,function(req,res){
        res.render('addtasks.ejs',taskData);
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
            const courseList = 'SELECT course_name from courses';
    
            // Now insert the task with the course_id
            const insertTaskQuery = 'INSERT INTO tasks (user_id,course_id, task_name, due_date, duration, priority, status) VALUES (?, ?, ?, ?, ?, ?, ?)';
            db.query(insertTaskQuery, [req.session.userDbId,courseId, req.body.taskName, req.body.dueDate, req.body.durationMinutes, req.body.priority, req.body.status], (err, taskResult) => {
                if (err) {
                    console.error('Error adding task:', err);
                    return res.status(500).send('Error adding task');
                }
                res.redirect('/viewtasks.ejs'); // Redirect to the view tasks page or another appropriate page
            });
        });
    });

    app.post('/updateTaskStatus', function(req, res) {
        const taskId = req.body.taskId;
        const newStatus = req.body.newStatus;
      
        // SQL query to update the status
        const sql = `UPDATE tasks SET status = ? WHERE task_id = ?`;
        
        // Execute the query
        // (Assuming 'db' is your database connection variable)
        db.query(sql, [newStatus, taskId], function(err, result) {
          if (err) {
            // Handle the error
            console.error(err);
            return res.send('Error updating status');
          }
      
          // Redirect back to the tasks page or handle as needed
          res.redirect('/viewtasks.ejs');
        });
      });

      app.post('/deleteTask',function(req,res) {
        const taskId = req.body.taskId;
        const newStatus = req.body.newStatus;

        const sqlquery = 'DELETE FROM tasks WHERE task_id = ?';

        db.query(sqlquery,[taskId], function(err,results) {
            if(err) {
                console.error(err);
                console.error("Error occurred while deleting the task:", error);
                res.status(500).send("An error occurred while deleting the task.");
            } else {
                res.redirect('/viewtasks.ejs')
            }

        })
      })
      
    
    

    app.get('/logout', redirectLogin, (req,res) => {
        req.session.destroy(err => {
        if (err) {
          return res.redirect('./')
        }
        res.redirect('./')
        })
    })


}