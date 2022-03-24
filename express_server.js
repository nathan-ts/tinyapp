const { generateRandomString, checkScheme, authUser, findEmailID, validEmail } = require('./helpFn');

const bcrypt = require('bcryptjs');

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const cookieParser = require('cookie-parser')

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}), cookieParser());

app.set("view engine", "ejs")


// Default URL database of short and long URLs
const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "user2RandomID" },
  "SuplrX": { longURL: "https://www.playlostark.com", userID: "userRandomID" },
  "q64A7G": { longURL: "https://na.finalfantasy.com", userID: "user2RandomID" },
  "loHenP": { longURL: "http://iro.ragnarokonline.com", userID: "userRandomID" },
  "OAQJtK": { longURL: "https://www.kingdomhearts.com", userID: "user2RandomID" },
};

// Default user database
const pw1 = "purple-monkey-dinosaur";
const pw2 = "dishwasher-funk";
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: bcrypt.hashSync(pw1, 10),
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: bcrypt.hashSync(pw2, 10),
  }
}

// Show text on root path
app.get("/", (req, res) => {
  res.send("This is a site for making small URLs. Please visit /urls to get started.");
});

// Show index page /urls/
app.get("/urls", (req, res) => {
  // Filter urls for logged in user only
  let filteredDB = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === req.cookies["user_id"]) {
      filteredDB[url] = urlDatabase[url];
    }
  }
  const templateVars = { 
    urls: filteredDB, 
    user: users[req.cookies["user_id"]],
  };
  console.log("All users: ", users);
  res.render("urls_index", templateVars);
});

// Add a short URL to database
app.post("/urls", (req, res) => {
  // Check if user is logged in
  const templateVars = { 
    user: users[req.cookies["user_id"]],
  };
  if (!templateVars.user) { // Redirect to /login if not logged in
    return res.status(403).redirect("/login");
  }
  // Get unique random identifier
  let id = generateRandomString(); 
  while (id in urlDatabase) {
    id = generateRandomString();
  }
  // Add new short URL to database and redirect to urls_show
  urlDatabase[id] = { 
    longURL: checkScheme(req.body.longURL), // Prepend https:// if url does not have it.
    userID: req.cookies["user_id"], 
  }; 
  res.redirect(`/urls/${id}`);
});

// Make a new short URL form
app.get("/urls/new", (req, res) => {
  const templateVars = { 
    user: users[req.cookies["user_id"]],
  };
  if (!templateVars.user) { // Redirect to /login if not logged in
    return res.status(403).redirect("/login");
  }
  res.render("urls_new", templateVars);
});

// Show information about a single short URL
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL, 
    user: users[req.cookies["user_id"]],
  };
  if (urlDatabase[req.params.shortURL].userID !== req.cookies["user_id"]) {
    return res.status(403).send("403: Cannot access a URL that does not belong to your account\n")
  }
  if (templateVars.shortURL in urlDatabase === false) { //if short URL not in db
    templateVars.shortURL = "N/A";
    templateVars.longURL = "Invalid TinyURL entered"
    templateVars.valid = false;
  } else { // shortURL exists in URL database
    templateVars.longURL = urlDatabase[req.params.shortURL].longURL;
    templateVars.valid = true;
  }
  res.render("urls_show", templateVars);
});

// Update an existing short URL with a new long URL
app.post("/urls/:id", (req, res) => {
  if (urlDatabase[req.params.id].userID !== req.cookies["user_id"]) {
    return res.status(403).send("403: Cannot edit a URL that does not belong to your account\n")
  }
  urlDatabase[req.params.id].longURL = checkScheme(req.body.id); // Prepend https:// if url does not have it.
  return res.redirect('/urls');
});

// Delete a short URL
app.post("/urls/:shortURL/delete", (req, res) => {
  if (urlDatabase[req.params.shortURL].userID !== req.cookies["user_id"]) {
    return res.status(403).send("403: Cannot delete a URL that does not belong to your account\n")
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

// Quick link to go to URL target
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

// Login page
let loginError = ""; // Global scope login error message
app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    error: loginError,
  };
  if (templateVars.user) { // Redirect to /urls if already logged in
    return res.redirect("/urls");
  }
  return res.render("urls_login", templateVars);
});

// Log in, search for userID of email, and set cookie
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const { error, data } = authUser(email, password, users);
  if (error) {
    console.log("Authentication error: ", error);
    loginError = error;
    return res.status(403).redirect("/login");
  }

  loginError = "";
  res.cookie("user_id", data.id);
  console.log(data, " logged in");
  return res.redirect('/urls');
});

// Log out and clear cookie
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  return res.redirect('/urls');
});

// Registration page
let registerError = ""; // Global scope registration error message
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    error: registerError,
  };
  if (templateVars.user) { // Redirect to /urls if already logged in
    return res.redirect("/urls");
  }
  return res.render("urls_register", templateVars);  
});

// Register a user in the users object
app.post("/register", (req, res) => {
  // Check if email is valid
  if (!validEmail(req.body.email)) {
    console.log("Invalid email entered; registration cancelled");
    registerError = "400: Invalid email entered";
    return res.status(400).redirect('/register');
  }
  if (findEmailID(req.body.email, users)) {
    console.log("Duplicate email entered; registration cancelled");
    registerError = "400: The email you have entered already exists in our database.";
    return res.status(400).redirect('/register');
  }
  registerError = ""; 

  const newID = generateRandomString();
  users[newID] = {
    id: newID,
    email: req.body.email, 
    password: bcrypt.hashSync(req.body.password, 10),
  };
  res.cookie("user_id", newID);
  console.log("Registration complete");
  console.log("Current user database:", users);
  return res.redirect('/urls');
});

// Show all URLs in database
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Start up server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

