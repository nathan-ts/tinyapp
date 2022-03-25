const bcrypt = require('bcryptjs');

// Returns a random 6 character string with upper, lower and numeric
const generateRandomString = function(length) {
  return Buffer.from(Math.random().toString()).toString("base64").substr(10, length);
}

// Returns a URL string with https:// prepended if there is no scheme on the URL provided
const checkScheme = function(url) {
  if (url.slice(0,4) !== "http") {
    url = `https://${url}`;
  }
  return url;
}

// Returns an object with error string (nullable) and 
// data object of user (nullable), given an email and password
const authUser = function(em, pw, userdb) {
  let userID = findEmailID(em, userdb);
  if (!userID) return {error: "Email not found.", data: null };
  if (!bcrypt.compareSync(pw, userdb[userID].password)) {
    return { error: "Incorrect password entered.", data: null };
  }
  return { error: null, data: userdb[userID] };
}

// Returns a userID string given an email and user database, or 
// returns undefined if not found
const findEmailID = function(email, userdb) {
  for (const userID in userdb) {
    if (userdb[userID].email === email) {
      return userID;
    }
  }
  return undefined;
};

// Returns true if an email contains @ and .
const validEmail = function(email) {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i;
  // console.log("Regex check:",email.match(emailRegex));
  return Boolean(email.match(emailRegex));
}

module.exports = { generateRandomString, checkScheme, authUser, findEmailID, validEmail };