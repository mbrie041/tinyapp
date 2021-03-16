const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true})); //body-parser library to read buffers

app.set("view engine", "ejs") //reads EJS

function generateRandomString() {
  let randomShortUrl = 6;
  return Math.random().toString(20).substr(2, randomShortUrl);  // function that returns a string of 6 random alphanumeric characters
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const httpChecker = (url) => {
  let givenLink = url.body.longURL; //take the url actual url given
  // console.log(givenLink)
  if (!givenLink.startsWith('http://') && (!givenLink.startsWith('https://'))) { //check to see if http(s) is included
    return givenLink = 'http://'+ givenLink; //add it if it isn't
  } else {
    return givenLink; //return the link if it is.
  }
};

app.post("/urls", (req, res) => {
  // const longUrl = req.body.longURL
  const newShortUrl = generateRandomString();   /// runs our function which will become the shortUrl
  let newUrl = httpChecker(req);
  // console.log(req.body.longURL)
  // urlDatabase[newShortUrl] = req.body.longURL;

  urlDatabase[newShortUrl] = newUrl;
  res.redirect(`/urls/${newShortUrl}`);         // Replaced ok with redirection to URL
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new"); //get route to render the urls_new.ejs
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL); //requests to the endpoint "/u/:shortURL" will redirect to its longURL
});

app.get("/urls/:shortURL", (req, res) => { //displays short urls
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars); //rendering info about a single url in URL Show
});

app.get("/urls", (req, res) => { //message at /urls
  const urlObject = { urls: urlDatabase };
  res.render("urls_index", urlObject); //displayed as a table in index
});


// app.get("/", (req, res) => { //message at root - provided (probably won't keep)
//   res.send("Hello!");
// });

// app.get("/urls/:shortURL", (req, res) => { //message at URLS.JSON - provided (probably won't keep)
//   res.json(urlDatabase);
// });

// app.get("/hello", (req, res) => { //message at /hello - provided (probably won't keep)
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});