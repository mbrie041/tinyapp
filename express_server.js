const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs")

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => { //message at root - provided (probably won't keep)
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => { //message at URLS.JSON - provided (probably won't keep)
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => { //message at /hello - provided (probably won't keep)
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => { //message at /urls
  const urlObject = { urls: urlDatabase };
  res.render("urls_index", urlObject);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});