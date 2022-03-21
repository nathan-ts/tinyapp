const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

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
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  res.render("urls_index", { urls: urlDatabase });
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});