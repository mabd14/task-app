module.exports = function (app, taskData) {
  const { check, validationResult } = require("express-validator");

  const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
      res.redirect("./login");
    } else {
      next();
    }
  };
  app.use(function (req, res, next) {
    res.locals.session = req.session;
    next();
  });

  app.get("/", function (req, res) {
    const data = {
      ...taskData,
      username: req.session.userId || null,
    };
    res.render("index.ejs", data);
  });

  app.get("/register", function (req, res) {
    res.render("register.ejs", taskData);
  });

  app.post("/registered", [check("email").isEmail()], function (req, res) {
    const bcrypt = require("bcrypt");
    const saltRounds = 10;
    const plainPassword = req.body.password;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.redirect("./register");
    } else {
      bcrypt.hash(plainPassword, saltRounds, function (err, hashedPassword) {
        if (err) {
          return console.error(err.message);
        }

        let sqlquery =
          "INSERT INTO users (first_name,last_name,username,email,u_password) VALUES (?,?,?,?,?)";
        let newrecord = [
          req.body.first,
          req.body.last,
          req.body.username,
          req.body.email,
          hashedPassword,
        ];

        db.query(sqlquery, newrecord, (err, result) => {
          if (err) {
            return console.error(err.message);
          } else {
            res.redirect("./");
          }
        });
      });
    }
  });

  app.get("/login", function (req, res) {
    res.render("login.ejs", taskData);
  });

  app.post("/loggedin", function (req, res) {
    const bcrypt = require("bcrypt");
    let sqlquery = "SELECT u_password, user_id FROM users WHERE username = ?";
    let user = [req.body.username];

    db.query(sqlquery, user, (err, result) => {
      if (err) {
        console.error("Database Error:", err.message);
        return res.status(500).send("Internal Server Error");
      }

      if (result.length === 0) {
        return res.status(400).send("User not found.");
      }

      const hashedPassword = result[0].u_password;

      bcrypt.compare(
        req.body.password,
        hashedPassword,
        function (err, isMatch) {
          if (err) {
            console.error("Bcrypt Error:", err.message);
            return res.status(500).send("Error while comparing passwords.");
          }

          if (isMatch) {
            req.session.userId = req.body.username;
            req.session.userDbId = result[0].user_id;
            res.redirect("./viewtasks");
          } else {
            res.status(401).send("Incorrect Password!");
          }
        }
      );
    });
  });

  app.get("/viewtasks", redirectLogin, function (req, res) {
    const loggedInUserId = req.session.userDbId; // Retrieve the logged-in user's ID from the session

    // Using the stored procedure
    const callProcedure = "CALL GetTasksForUser(?)";
    db.query(callProcedure, [loggedInUserId], (err, results) => {
      if (err) {
        console.error("Error fetching tasks:", err);
        return res.status(500).send("Error fetching tasks");
      }
      res.render("viewtasks.ejs", { tasks: results[0] });
    });
  });

  app.get("/addtasks", redirectLogin, function (req, res) {
    const getCoursesQuery = "SELECT course_name FROM courses";
    db.query(getCoursesQuery, (err, results) => {
        if (err) {
            console.error("Error fetching courses:", err);
            return res.status(500).send("Error fetching courses");
        }
            res.render("addtasks.ejs", {courses: results });
    });
});


app.post("/addedtask", function (req, res) {
  const courseSelect = req.body.courseSelect;
  const newCourseName = req.body.newCourseName[0];

  // Function to insert the task
  function insertTask(courseId) {
      const insertTaskQuery = "INSERT INTO tasks (user_id, course_id, task_name, due_date, duration, priority, status) VALUES (?, ?, ?, ?, ?, ?, ?)";
      db.query(insertTaskQuery, [req.session.userDbId, courseId, req.body.taskName, req.body.dueDate, req.body.durationMinutes, req.body.priority, req.body.status], (err, taskResult) => {
          if (err) {
              console.error("Error adding task:", err);
              return res.status(500).send("Error adding task");
          }
          res.redirect("./viewtasks");
      });
  }

  if (courseSelect === 'newCourse' && newCourseName) {
      // Insert the new course first, then the task
      const insertCourseQuery = "INSERT INTO courses (course_name) VALUES (?)";
      console.log('newCourseName:', newCourseName, 'Type:', typeof newCourseName);
      db.query(insertCourseQuery, [newCourseName], (err, courseResult) => {
          if (err) {
              console.error("Error adding course:", err);
              return res.status(500).send("Error adding course");
          }
          insertTask(courseResult.insertId); // Insert the task with the new course ID
      });
  } else {
      // Existing course is selected, so use its course ID
      // fetch the course ID based on courseSelect (which should be the course name)
      const getCourseIdQuery = "SELECT course_id FROM courses WHERE course_name = ?";
      db.query(getCourseIdQuery, [courseSelect], (err, result) => {
          if (err || result.length === 0) {
              console.error("Error fetching course ID:", err);
              return res.status(500).send("Error fetching course ID");
          }
          insertTask(result[0].course_id); // Insert the task with the existing course ID
      });
  }
});


  app.post("/updateTaskStatus", function (req, res) {
    const taskId = req.body.taskId;
    const newStatus = req.body.newStatus;

    // SQL query to update the status
    const sql = `UPDATE tasks SET status = ? WHERE task_id = ?`;

    // Execute the query
    // (Assuming 'db' is your database connection variable)
    db.query(sql, [newStatus, taskId], function (err, result) {
      console.log(taskId)
      if (err) {
        // Handle the error
        console.error(err);
        return res.send("Error updating status");
      }

      // Redirect back to the tasks page or handle as needed
      res.redirect("./viewtasks");
    });
  });

  app.post("/deleteTask", function (req, res) {
    const taskId = req.body.taskId;
    const newStatus = req.body.newStatus;

    const sqlquery = "DELETE FROM tasks WHERE task_id = ?";

    db.query(sqlquery, [taskId], function (err, results) {
      if (err) {
        console.error(err);
        console.error("Error occurred while deleting the task:", err);
        res.status(500).send("An error occurred while deleting the task.");
      } else {
        res.redirect("./viewtasks");
      }
    });
  });

  app.get("/focus", redirectLogin, (req, res) => {
    res.render("pomo.ejs");
  });

  app.get("/logout", redirectLogin, (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.redirect("./");
      }
      res.redirect("./");
    });
  });

  app.get("/api", function (req, res) {
    let sqlquery = "select * from tasks";
    db.query(sqlquery, function (err, result) {
      if (err) {
        console.error(err);
      } else {
        res.json(result);
      }
    });
  });
};
