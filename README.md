# Scholar Flow

The primary goal of this application is to assist students in organizing their academic tasks and managing their time efficiently throughout their degree.

## Features:

### 1. To-Do List:
- **Due Date:** Enter the due date for the task
- **Associated Course:** Link tasks with specific courses such as Databases, AI, etc.
- **Priority Levels:** Classify tasks into three levels – low, medium, and high.
- **Status of Task** Classify tasks into three levels - pending, overdue and completed.
- **Sorting:** Enable users to sort their tasks based on status.

### 2. Pomodoro Timer:
- **Pomodoro  Integration:** Offers a pomodoro timer to boost productivity.

### 3. Database Integration:
- **Task Storage:** Securely save and retrieve tasks.
- **User Session:** Remember and load tasks each time a user logs in.

### 4. Search & Filter:
- **Task Search:** Equip users with the ability to search specific tasks.
- **Task Filtering:** Implement filtering options for refined task views, based on their status.

### 5. Quick Note:
- **Notes for each course:** Allows the user to write a quick note to save later


## Setting up the app
To set up the app you need to have Node installed on your local computer as well as the following modules

Express
```
npm install express
```

EJS
```
npm install ejs
```

MySQL
```
npm install mysql
```

Express-session
```
npm install express-session
```

Body-parser
```
npm install body-parser
```

Once you have a working SQL database and have downloaded these modules, then do:
```
node index.js
```
