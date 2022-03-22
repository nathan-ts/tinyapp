const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const cookieParser = require('cookie-parser')

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs")

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  "q64A7G": "https://na.finalfantasy.com",
  "loHenP": "http://iro.ragnarokonline.com",
  "SuplrX": "https://www.playlostark.com",
  "OAQJtK": "https://www.kingdomhearts.com"
};

// Show text on root path
app.get("/", (req, res) => {
  res.send("This is a site for making small URLs.");
});

// Show index page /urls/
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
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
  let longURL = req.body.longURL;
  if (longURL.slice(0,4) !== "http") {
    longURL = `https://${longURL}`;
  }
  // Add new short URL to database and redirect to urls_show
  urlDatabase[id] = longURL;
  res.redirect(`/urls/${id}`);
});

// Make a new short URL form
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// Show information about a single short URL
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    valid: true,
    id: req.params.shortURL
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
  let longURL = req.body.id;
  if (longURL.slice(0,4) !== "http") {
    longURL = `https://${longURL}`;
  }
  urlDatabase[req.params.id] = longURL;
  res.redirect(`/urls`);
});

// Delete a short URL
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
});

// Quick link to go to URL target
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
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
