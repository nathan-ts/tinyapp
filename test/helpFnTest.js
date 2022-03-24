const { assert } = require('chai');

const { findEmailID } = require('../helpFn.js');

const testUsers = {
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

describe('findEmailID', function() {
  it('should return a user with valid email', function() {
    const user = findEmailID("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert.equal(user, expectedUserID);
  });
  it('should return undefined with an invalid email', function() {
    const user = findEmailID("azure@diamond.com", testUsers)
    const expectedUserID = undefined;
    assert.equal(user, expectedUserID);
  });
});