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

module.exports = {
  findUserByEmail,
  generateRandomString,
};