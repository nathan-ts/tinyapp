const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

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

app.get("/", (req, res) => {
  res.send("This is a site for making small URLs.");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  // console.log(JSON.stringify(req.body));  // Log the POST request body to the console
  const id = generateRandomString(); // get random identifier
  // Add https:// if url does not have it.
  let longURL = req.body.longURL;
  if (longURL.slice(0,4) !== "http") {
    longURL = `https://${longURL}`;
  }

  urlDatabase[id] = longURL;
  res.redirect(`/urls/${id}`);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    valid: true,
  };
  if (templateVars.shortURL in urlDatabase === false) {
    templateVars.shortURL = "N/A";
    templateVars.longURL = "Invalid TinyURL entered"
    templateVars.valid = false;
  }
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  return Buffer.from(Math.random().toString()).toString("base64").substr(10, 6);
}
