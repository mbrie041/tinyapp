//Global Vars

const cookieParser = require('cookie-parser')
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.use(cookieParser())
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true })); //body-parser library to read buffers
app.set("view engine", "ejs") //reads EJS

const urlDatabase = { //website data hard coded in
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
};

//helper functions

function generateRandomString() {
  let randomShortUrl = 6;
  return Math.random().toString(20).substr(2, randomShortUrl);  // function that returns a string of 6 random alphanumeric characters
};


const httpChecker = (givenLink) => {
  // let givenLink = url.body.longURL; //take the url actual url given
  // console.log(givenLink)
  if (!givenLink.startsWith('http://') && (!givenLink.startsWith('https://'))) { //check to see if http(s) is included
    return givenLink = 'http://' + givenLink; //add it if it isn't
  } else {
    return givenLink; //return the link if it is.
  }
};

const updateURL = (givenShortUrl, givenLongUrl) => {
  urlDatabase[givenShortUrl] = httpChecker(givenLongUrl);// update the content of the url
};

const addNewUser = (newID, userObject) => {
  users[newID] = userObject
};

const findUserByEmail = (givenEmail) => {
  // loop and try to match the email
  for (let userId in users) {
    const userObj = users[userId];
    if (userObj.email === givenEmail) {
      // if found return the user
      return userObj;
    }
  }
  // if not found return false
  return false;
};

// const authenticateUser = (givenEmail, givenPassword) => {
//   const userFound = findUserByEmail(givenEmail);
//   if (userFound) {
//     // user already exists
//     return 'error400';
//   }
//   if (givenEmail === "" || givenPassword === "") {
//     // one of the values is empty
//     return 'error400'
//   }
//   return;
// };

//website functions

app.post("/urls", (req, res) => { //adds new url to database
  const longUrl = req.body.longURL
  const newShortUrl = generateRandomString();   /// runs our function which will become the shortUrl
  updateURL(newShortUrl, longUrl); //updated to include update URL function to cut down code
  res.redirect(`/urls/${newShortUrl}`);// Replaced ok with redirection to URL
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies["user_ID"]] };
  res.render("urls_new", templateVars); //get route to render the urls_new.ejs
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL); //requests to the endpoint "/u/:shortURL" will redirect to its longURL
});

app.get("/urls/:shortURL", (req, res) => { //displays short urls
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[req.cookies["user_ID"]] };
  res.render("urls_show", templateVars); //get route to render info about a single url in URL Show
});

app.get('/login', (req, res) => { //route to the login page
  const templateVars = { user: users[req.cookies["user_ID"]] }
  console.log("@login users is >>", users)
  res.render("urls_login", templateVars)
});

app.post("/login", (req, res) => { //login route that takes a username
  const userObj = findUserByEmail(req.body.email);
  console.log("users",users)
  console.log("userObj>>>",userObj)
  console.log("password>>> ",req.body.password)
  if (userObj && userObj.password === req.body.password) {
    res.cookie("user_ID", userObj.userID);
    res.redirect('/urls');
  } else {
    res.sendStatus(403);
  }
});

app.post("/logout", (req, res) => { //Logout route removes cookies of a username
  res.clearCookie("user_ID")
  console.log("@logout users is>>", users)
  res.redirect("/urls")
});

app.get("/urls", (req, res) => { //message at /urls
  const urlObject = { urls: urlDatabase, user: users[req.cookies["user_ID"]] };
  res.render("urls_index", urlObject); //displayed as a table in index
});

app.post("/urls/:shortURL/delete", (req, res) => { //request to remove url
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post('/urls/:shortURL/edit', (req, res) => { //change url to given url

  const givenShortUrl = req.params.shortURL;
  const givenLongUrl = req.body.shortURL;
  // console.log("Longurl>>",givenLongUrl)
  // console.log("Shorturl>>",givenShortUrl)

  updateURL(givenShortUrl, givenLongUrl);

  res.redirect(`/urls/${givenShortUrl}`); //redirects to the new url page upon completion
});

app.get('/register', (req, res) => { //route to the register page
  const templateVars = { user: users[req.cookies["user_ID"]] };
  // console.log(templateVars)
  res.render("urls_register", templateVars)
})

app.post('/register', (req, res) => { //adding new registrationg data to cookies
  let userID = generateRandomString();
  const { email, password } = req.body;
  //check to if user email is an emptry string
  //check to if user exists in the database
  if (!email || !password || findUserByEmail(email)) {
    // one of the values is empty
    res.sendStatus(400)
    return;
  };
  //if checks pass, add the new user
  addNewUser(userID, { userID, email, password })
  // console.log(users)
  res.cookie("user_ID", userID);
  res.redirect('/urls')
})

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