module.exports = function(app, taskData) {

app.get('/',function(req,res){
    res.render('index.ejs', taskData);
});

app.get('/about',function(req,res) {
    res.render('about.ejs',taskData);
});

app.get('/register',function(req,res) {
    res.render('register.ejs',taskData);
});

app.get('/login',function(req,res) {
    res.render('login.ejs',taskData);
});

app.get('/viewtasks',function(req,res) {
    res.render('viewTasks.ejs',taskData);
});

app.get('/addtasks',function(req,res){
    res.render('addTasks.ejs',taskData);
});

}