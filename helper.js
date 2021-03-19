/////////////////////////////
//////Helper Functions//////
///////////////////////////

const findUserByEmail = (givenEmail,givenDataBase) => { //Checks to see if a user exists by their email
  for (let userId in givenDataBase) { //If found return the user
    const userObj = givenDataBase[userId];
    if (userObj.email === givenEmail) {
      return userObj; //If found return the user
    }
  }
  return null; //If not found return false
};

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

const userCompare = (currentUser, userDbValue) => { //checks to see if the current user matches the users value in the database
  if (currentUser === userDbValue) {
    return true;
  } else {
    return false;
  }
};


module.exports = {
  findUserByEmail,
  generateRandomString,
  httpChecker,
  userCompare,
};