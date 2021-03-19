////////////////////////
//////Global Vars//////
//////////////////////

const bcrypt = require('bcrypt');
const express = require("express");
const app = express();
const PORT = 8080;
const cookieSession = require('cookie-session');
const helper = require('./helper');


app.use(cookieSession({
  name: 'session',
  keys: ['password'],
  maxAge: 24 * 60 * 60 * 1000
}));

const bodyParser = require("body-parser");
const { use } = require('bcrypt/lib/promises');
const { request } = require('express');
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  sgq3y6: { longURL: "https://www.reddit.com", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aM5k7" }
};

const users = {
  "aJ48lW": {
    userID: "aJ48lW",
    email: "user@example.com",
    password: bcrypt.hashSync("password", 10)

  },
  "aM5k7": {
    userID: "aM5k7",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  },
  "ADMIN": {
    userID: "ADMIN",
    email: "admin@test.com",
    password: bcrypt.hashSync("test", 10)
  }
};

/////////////////////////////
//////Helper Functions//////
///////////////////////////

const updateURL = (givenShortUrl, givenLongUrl, userID) => { //Adds or updates the content of the url
  urlDatabase[givenShortUrl] = { longURL: helper.httpChecker(givenLongUrl), userID };
};

const addNewUser = (newID, userObject) => { //Adds a new user to the database
  users[newID] = userObject;
};

const urlsForUser = (id) => { //creates an obj that includes all the shorturls for a user
  const newObj = {};
  for (let shortUrls in urlDatabase) {
    if (id === urlDatabase[shortUrls].userID) {
      newObj[shortUrls] = urlDatabase[shortUrls];
    }
  } return newObj;
};

//////////////////////////////
//////Website Functions//////
////////////////////////////

//// Accessing URL index page

app.get("/urls", (req, res) => { //takes you to the main index
  const iteratedObject = urlsForUser(req.session.user_id); //iterates through the database and returns only values for that user
  const templateVars = { urls: iteratedObject, user: users[req.session.user_id] };
  res.render("urls_index", templateVars);
});

//// Adding and accessing new URL's

app.post("/urls", (req, res) => { //adds new url to database and displays it on the index
  const longURL = req.body.longURL;
  const newShortUrl = helper.generateRandomString();   /// runs our function which will become the shortUrl
  updateURL(newShortUrl, longURL, req.session.user_id); //updated to include update URL function to cut down code
  res.redirect(`/urls/${newShortUrl}`);// Replaced ok with redirection to URL
});

app.get("/urls/new", (req, res) => { //redirects to add new Url page
  if (req.session.user_id) { //if logged in
    const templateVars = { user: users[req.session.user_id] };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");//if not logged in, redirects to log in page.
  }
});

//// Accessing the long URL or the short URL via shortcuts

app.get("/u/:shortURL", (req, res) => { //"/u/:shortURL" will redirect to its matching longURL
  const longURLRedirected = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURLRedirected);
});

app.get("/urls/:shortURL", (req, res) => { //displays short urls
  const currentUser = req.session.user_id;
  const userDbValue = urlDatabase[req.params.shortURL].userID;
  if (helper.userCompare(currentUser, userDbValue)) {
    const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[req.session.user_id] };
    res.render("urls_show", templateVars); //get route to render info about a single url in URL Show
  } else {
    res.sendStatus(403);
  }
});

//// Registering

app.get('/register', (req, res) => { //route to the register page
  const templateVars = { user: users[req.session.user_id] };
  res.render("urls_register", templateVars);
});

app.post('/register', (req, res) => { //adding new registration to database and cookies
  let userID = helper.generateRandomString();
  const { email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (!email || !password || helper.findUserByEmail(email, users)) {  //check to if user email exists and exists in the database
    res.sendStatus(400); // error if any of the values are falsey
    return;
  }
  addNewUser(userID, { userID, email, password: hashedPassword }); //if passes checks, add the new user
  req.session.user_id = (userID);
  res.redirect('/urls');
});

//// Logging in and logging out

app.get('/login', (req, res) => { //route to the login page
  const templateVars = { user: users[req.session.user_id] };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => { // Log in function
  const userObj = helper.findUserByEmail(req.body.email, users);
  if (userObj && bcrypt.compareSync(req.body.password, userObj.password)) { //checks to see if user name & password exist/match
    req.session.user_id = userObj.userID;
    res.redirect('/urls'); //if sign in works then redirect to URL Index page
  } else {
    res.sendStatus(403);
  }
});

app.post("/logout", (req, res) => { //Logout route removes cookies of a username
  req.session.user_id = null;
  res.redirect("/urls");
});

//// Editting and Deleting URLs

app.post("/urls/:shortURL/delete", (req, res) => { //request to remove url
  const currentUser = req.session.user_id;
  const userDbValue = urlDatabase[req.params.shortURL].userID;
  if (helper.userCompare(currentUser, userDbValue)) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls"); //redirects to URL index page
  } else {
    res.sendStatus(403);
  }
});

app.post('/urls/:shortURL/edit', (req, res) => { //change url to given url
  const currentUser = req.session.user_id;
  const userDbValue = urlDatabase[req.params.shortURL].userID;
  const givenShortUrl = req.params.shortURL;
  const givenLongUrl = req.body.shortURL;
  if (helper.userCompare(currentUser, userDbValue)) {
    updateURL(givenShortUrl, givenLongUrl, req.session.user_id);
    res.redirect(`/urls/${givenShortUrl}`); //redirects to the new url page upon completion
  } else {
    res.sendStatus(403);
  }
});

//// Dev tools
app.listen(PORT, () => { //Console logs connection to the server
  console.log(`Example app listening on port ${PORT}!`);
});