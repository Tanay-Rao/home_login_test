const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')
const Database = require("@replit/database");
const db = new Database();

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));

// Middleware to check if the user is logged in
const requireLogin = (req, res, next) => {
  const loggedIn = req.cookies.loggedIn;
  if (loggedIn === "true") {
    next(); // User is logged in, continue to the next middleware or route handler
  } else {
    res.redirect("/login"); // User is not logged in, redirect to the login page
  }
};

app.get("/", requireLogin, (req, res) => {
  // Only logged-in users can access this page
  const username = req.cookies.username;
  db.list().then(keys => {
    if(keys.includes(username)){
      res.render("loggedin.html",{username:username})
    } else{
      res.redirect("/logout");
    }
  });
});

app.get("/login", (req, res) => {
  loggedIn = req.cookies.loggedIn;
  if(loggedIn == "true"){
    res.redirect("/");
  } else{
    res.render("login.html");
  }
});

app.get("/signup", (req, res) => {
  loggedIn = req.cookies.loggedIn;
  if(loggedIn == "true"){
    res.redirect("/");
  } else{
    res.render("signup.html");
  }
});

// Rest of your code for login, signup, and logout routes

app.get("/", (req, res) => {
  loggedIn = req.cookies.loggedIn;
  username = req.cookies.username;
  if(loggedIn == "true"){
    db.list().then(keys => {
      if(keys.includes(username)){
        res.render("loggedin.html",{username:username})
      } else{
        res.redirect("/logout");
      }
    });
  } else{
    res.render("notloggedin.html");
  }
});

app.get("/login", (req, res) => {
  loggedIn = req.cookies.loggedIn;
  if(loggedIn == "true"){
    res.redirect("/");
  } else{
    res.render("login.html");
  }
})

app.get("/signup", (req, res) => {
  loggedIn = req.cookies.loggedIn;
  if(loggedIn == "true"){
    res.redirect("/");
  } else{
    res.render("signup.html");
  }
});

app.get("/login", (req, res) => {
  const loggedIn = req.cookies.loggedIn;
  if (loggedIn === "true") {
    res.redirect("/");
  } else {
    const errorMessage = req.query.error; // Get error message from query parameter
    res.render("login.html", { errorMessage }); // Pass error message to template
  }
});

app.post("/loginsubmit", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  db.list().then(keys => {
    if (keys.includes(username)) {
      db.get(username).then(value => {
        if (password === value) {
          res.cookie("loggedIn", "true");
          res.cookie("username", username);
          console.log("logged in successfully");
          res.redirect("/");
        } else {
          // Pass error message to login page
          res.redirect("/login?error=Wrong%20password");
        }
      });
    } else {
      // Pass error message to login page
      res.redirect("/login?error=Account%20not%20found");
    }
  });
});

app.post("/createaccount", (req, res) => {
  var newusername = req.body.newusername;
  newpassword = req.body.newpassword;
  letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
  cap_letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
  numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  allchars = letters + cap_letters + numbers + ['_'];
  goodusername = true;
  for(let i of newusername){
    if(!allchars.includes(i)){
      goodusername = false;
    }
  }
  if(goodusername){
    db.list().then(keys => {
      if(keys.includes(newusername)){
        res.send("Username taken.");
      } else if(newusername == ""){
        res.send("Please enter a username.");
      } else if(newpassword == ""){
        res.send("Please enter a password.")
      } else{
        db.set(newusername, newpassword).then(() => console.log("new account created"));
        res.cookie("loggedIn", "true")
        res.cookie("username", newusername);
        res.redirect("/");
      }
    });
  } else{
    res.send("Username can only contain alphanumeric characters and underscores.")
  }
});

app.get("/logout", (req, res) => {
  res.cookie("loggedIn", "false");
  res.clearCookie("username");
  res.redirect("/");
  console.log("successfully logged out")
});


app.listen(3000, () => {
  console.log("server started");
});
