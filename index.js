// Import necessary modules
var express = require('express');
var ejs = require('ejs');
var bodyParser = require('body-parser');

// Create the Express application
const app = express();
const port = 8000;

// Middleware to parse request body
app.use(bodyParser.urlencoded({ extended: true }));

// Set the directory for EJS templates and use EJS as the view engine
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// Define shop data
var taskData = { name: "Scholar Flow" };

// Require and use your routes
require("./routes/main")(app, taskData);

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
