// LOG IN DOES NOT WORK, it's setting cookie as a separate id than the id registered




const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const cookieParser = require('cookie-parser')

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}), cookieParser());

app.set("view engine", "ejs")

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  "SuplrX": "https://www.playlostark.com",
  "q64A7G": "https://na.finalfantasy.com",
  "loHenP": "http://iro.ragnarokonline.com",
  "OAQJtK": "https://www.kingdomhearts.com",
};

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
  res.send("This is a site for making small URLs.");
});

// Show index page /urls/
app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase, 
    user: users[req.cookies["user-id"]],
  };
  res.render("urls_index", templateVars);
});

// Add a short URL to database
app.post("/urls", (req, res) => {
  // Get unique random identifier
  let id = generateRandomString(); 
  while (id in urlDatabase) {
    id = generateRandomString();
  }
  // Prepend https:// if url does not have it.
  let longURL = checkScheme(req.body.longURL);
  

  // Add new short URL to database and redirect to urls_show
  urlDatabase[id] = longURL;
  res.redirect(`/urls/${id}`);
});

// Make a new short URL form
app.get("/urls/new", (req, res) => {
  const templateVars = { 
    user: users[req.cookies["user-id"]],
  };
  res.render("urls_new", templateVars);
});

// Show information about a single short URL
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    valid: true,
    id: req.params.shortURL,
    user: users[req.cookies["user-id"]],
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
  // Prepend https:// if url does not have it.
  let longURL = checkScheme(req.body.id);
  urlDatabase[req.params.id] = longURL;
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

// Log in, search for userID of email, and set cookie
app.post("/login", (req, res) => {
  const email = req.body.email;
  const toLogIn = "";
  for (let user in users) {
    if (user.email === email) toLogIn = user;
  }
  res.cookie("user_id",toLogIn);
  res.redirect('/urls');
});

// Log out and clear cookie
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect('/urls');
});

// Returns registration page
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user-id"]],
  };
  res.render("urls_register", templateVars);
});

// Register a user in the users object
app.post("/register", (req, res) => {
  const newID = generateRandomString();
  users[newID] = {
    id: newID,
    email: req.body.email, 
    password: req.body.password,
  };
  res.cookie("user_id", newID);
  console.log("Cookies", req.cookies);
  console.log("Users", users);
  res.redirect('/urls');
});

// Show all URLs in database
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  return Buffer.from(Math.random().toString()).toString("base64").substr(10, 6);
}

function checkScheme(url) {
  if (url.slice(0,4) !== "http") {
    url = `https://${url}`;
  }
  return url;
}