////////////////////////
//////Global Vars//////
//////////////////////

const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const express = require("express");
const app = express();
const PORT = 8080;

app.use(cookieParser());
const bodyParser = require("body-parser");
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
    password: "password"
  },
  "aM5k7": {
    userID: "aM5k7",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  "ADMIN": {
    userID: "ADMIN",
    email: "admin@test.com",
    password: "test"
  }
};

/////////////////////////////
//////Helper Functions//////
///////////////////////////

const generateRandomString = () => { //Function that returns a string of 6 random alphanumeric characters
  let randomShortUrl = 6;
  return Math.random().toString(20).substr(2, randomShortUrl);
};

const httpChecker = (givenLink) => { //Adds on http if not previously included
  if (!givenLink.startsWith('http://') && (!givenLink.startsWith('https://'))) { //check to see if http(s) is included
    return givenLink = 'http://' + givenLink; //add it if it isn't
  } else {
    return givenLink; //return the link if it is.
  }
};

const updateURL = (givenShortUrl, givenLongUrl, userID) => { //Adds or updates the content of the url
  urlDatabase[givenShortUrl] = { longURL: httpChecker(givenLongUrl), userID };
};

const addNewUser = (newID, userObject) => { //Adds a new user to the database
  users[newID] = userObject;
};

const findUserByEmail = (givenEmail) => { //Checks to see if a user exists by their email
  for (let userId in users) { //If found return the user
    const userObj = users[userId];
    if (userObj.email === givenEmail) {
      return userObj; //If found return the user
    }
  }
  return false; //If not found return false
};

const userCompare = (currentUser, userDbValue) => { //checks to see if the current user matches the users value in the database
  if (currentUser === userDbValue) {
    return true;
  } else {
    return false;
  }
};

const urlsForUser = (id) => { //creates an obj that includes all the shorturls for a user
  const newObj = {};
  for (shortUrls in urlDatabase) {
    if (id === urlDatabase[shortUrls].userID) {
      newObj[shortUrls] = urlDatabase[shortUrls]
    }
  } return newObj;
};

//////////////////////////////
//////Website Functions//////
////////////////////////////

//// Accessing URL index page

app.get("/urls", (req, res) => { //takes you to the main index 
  const iteratedObject = urlsForUser(req.cookies["user_ID"])//iterates through the database and returns only values for that user 
  const templateVars = { urls: iteratedObject, user: users[req.cookies["user_ID"]] };
  res.render("urls_index", templateVars);
});

//// Adding and accessing new URL's

app.post("/urls", (req, res) => { //adds new url to database and displays it on the index
  const longURL = req.body.longURL;
  const newShortUrl = generateRandomString();   /// runs our function which will become the shortUrl
  updateURL(newShortUrl, longURL, req.cookies["user_ID"]); //updated to include update URL function to cut down code
  res.redirect(`/urls/${newShortUrl}`);// Replaced ok with redirection to URL
});

app.get("/urls/new", (req, res) => { //redirects to add new Url page
  if (req.cookies["user_ID"]) { //if logged in
    const templateVars = { user: users[req.cookies["user_ID"]] };
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
  const currentUser = req.cookies["user_ID"];
  const userDbValue = urlDatabase[req.params.shortURL].userID;
  if (userCompare(currentUser, userDbValue)) {
    const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[req.cookies["user_ID"]] };
    res.render("urls_show", templateVars); //get route to render info about a single url in URL Show
  } else {
    res.sendStatus(403);
  }
});

//// Registering

app.get('/register', (req, res) => { //route to the register page
  const templateVars = { user: users[req.cookies["user_ID"]] };
  res.render("urls_register", templateVars);
});

app.post('/register', (req, res) => { //adding new registration to database and cookies
  let userID = generateRandomString();
  const { email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (!email || !password || findUserByEmail(email)) {  //check to if user email exists and exists in the database
    res.sendStatus(400); // error if any of the values are falsey
    return;
  }
  addNewUser(userID, { userID, email, password: hashedPassword}); //if passes checks, add the new user
  res.cookie("user_ID", userID);
  res.redirect('/urls');
});

//// Logging in and logging out

app.get('/login', (req, res) => { //route to the login page
  const templateVars = { user: users[req.cookies["user_ID"]] };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => { // Log in function
  const userObj = findUserByEmail(req.body.email);
  if (userObj && bcrypt.compareSync(req.body.password, userObj.password)) { //checks to see if user name & password exist/match
    res.cookie("user_ID", userObj.userID);
    res.redirect('/urls'); //if sign in works then redirect to URL Index page
  } else {
    res.sendStatus(403);
  }
});

app.post("/logout", (req, res) => { //Logout route removes cookies of a username
  res.clearCookie("user_ID");
  res.redirect("/urls");
});

//// Editting and Deleting URLs

app.post("/urls/:shortURL/delete", (req, res) => { //request to remove url
  const currentUser = req.cookies["user_ID"]
  const userDbValue = urlDatabase[req.params.shortURL].userID;
  if (userCompare(currentUser, userDbValue)) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls"); //redirects to URL index page
  } else {
    res.sendStatus(403);
  }
});

app.post('/urls/:shortURL/edit', (req, res) => { //change url to given url
  const currentUser = req.cookies["user_ID"]
  const userDbValue = urlDatabase[req.params.shortURL].userID;
  const givenShortUrl = req.params.shortURL;
  const givenLongUrl = req.body.shortURL;
  if (userCompare(currentUser, userDbValue)) { 
    updateURL(givenShortUrl, givenLongUrl);
    res.redirect(`/urls/${givenShortUrl}`); //redirects to the new url page upon completion
  } else {
    res.sendStatus(403);
  }

});

//// Dev tools
app.listen(PORT, () => { //Console logs connection to the server
  console.log(`Example app listening on port ${PORT}!`);
});