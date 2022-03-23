const { generateRandomString, checkScheme, authUser, findEmailID, validEmail } = require('./helpFn');

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const cookieParser = require('cookie-parser')

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}), cookieParser());

app.set("view engine", "ejs")


// Default URL database of short and long URLs
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  "SuplrX": "https://www.playlostark.com",
  "q64A7G": "https://na.finalfantasy.com",
  "loHenP": "http://iro.ragnarokonline.com",
  "OAQJtK": "https://www.kingdomhearts.com",
};

// Default user database
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

// Show text on root path
app.get("/", (req, res) => {
  res.send("This is a site for making small URLs. Please visit /urls to get started.");
});

// Show index page /urls/
app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase, 
    user: users[req.cookies["user_id"]],
  };
  // console.log(req.cookies["user_id"]);
  // console.log(users);
  // console.log("Rendering urls_index with user", templateVars.user);
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
  urlDatabase[id] = checkScheme(req.body.longURL);; // Prepend https:// if url does not have it.
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
    longURL: urlDatabase[req.params.shortURL],
    valid: true,
    id: req.params.shortURL,
    user: users[req.cookies["user_id"]],
  };
  if (templateVars.shortURL in urlDatabase === false) {
    templateVars.shortURL = "N/A";
    templateVars.longURL = "Invalid TinyURL entered"
    templateVars.valid = false;
  }
  res.render("urls_show", templateVars);
});

// Update an existing short URL with a new long URL
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = checkScheme(req.body.id); // Prepend https:// if url does not have it.
  res.redirect('/urls');
});

// Delete a short URL
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

// Quick link to go to URL target
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
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
    password: req.body.password,
  };
  res.cookie("user_id", newID);
  // console.log("body email validity is ", validEmail(req.body.email));
  // console.log("bad test validity is", validEmail("badtest"));
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

