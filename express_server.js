//Global Vars

const cookieParser = require('cookie-parser')
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.use(cookieParser())
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true})); //body-parser library to read buffers
app.set("view engine", "ejs") //reads EJS

const urlDatabase = { //website data hard coded in
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//helper functions

function generateRandomString() {
  let randomShortUrl = 6;
  return Math.random().toString(20).substr(2, randomShortUrl);  // function that returns a string of 6 random alphanumeric characters
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

const updateURL = (givenShortUrl, givenLongUrl) => {
  urlDatabase[givenShortUrl] = givenLongUrl;// update the content of the url
};

//website functions

app.post("/urls", (req, res) => {
  // const longUrl = req.body.longURL
  const newShortUrl = generateRandomString();   /// runs our function which will become the shortUrl
  let newUrl = httpChecker(req);
  // console.log(req.body.longURL)
  // urlDatabase[newShortUrl] = req.body.longURL;

  urlDatabase[newShortUrl] = newUrl;
  res.redirect(`/urls/${newShortUrl}`);// Replaced ok with redirection to URL
});

app.get("/urls/new", (req, res) => {
  const templateVars = {username: req.cookies["username"]}; 
  res.render("urls_new", templateVars); //get route to render the urls_new.ejs
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL); //requests to the endpoint "/u/:shortURL" will redirect to its longURL
});

app.get("/urls/:shortURL", (req, res) => { //displays short urls
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies["username"]};
  res.render("urls_show", templateVars); //get route to render info about a single url in URL Show
});

app.post("/login", (req, res) => { //login route that takes a username
  res.cookie('username', req.body.username)
  res.redirect("/urls")
});

app.post("/logout", (req, res) => { //Logout route removes cookies of a username
  res.clearCookie('username')
  res.redirect("/urls")
});

app.get("/urls", (req, res) => { //message at /urls
  const urlObject = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_index", urlObject); //displayed as a table in index
});

app.post("/urls/:shortURL/delete", (req,res) => { //request to remove url
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post('/urls/:shortURL/edit', (req, res) => { //change url to given url

  const givenShortUrl= req.params.shortURL;
  const givenLongUrl = req.body.shortURL;
  // console.log("Longurl>>",givenLongUrl)
  // console.log("Shorturl>>",givenShortUrl)

  updateURL(givenShortUrl, givenLongUrl);

  res.redirect(`/urls/${givenShortUrl}`); //redirects to the new url page upon completion
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