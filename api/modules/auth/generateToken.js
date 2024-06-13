const jwt = require('jsonwebtoken');

// Secret key for signing JWT tokens
const jwtSecretKey = process.env.JWT_SECRET;

/**
 * Function to generate a JWT token for a user
 * @param {Object} user - User object containing user details
 * @returns {string} - Generated JWT token
 */
function generateToken(user) {
  // Payload to be included in the JWT token
  const payload = {
    userId: user.userId, // Add the user's unique identifier here
    username: user.username, // Add the user's username
  };

  // Token expiration time from environment variables
  const jwtExpiration = process.env.JWT_EXPIRES_IN;

  // Generate the token with the payload, secret key, and expiration time
  const token = jwt.sign(payload, jwtSecretKey, { expiresIn: jwtExpiration });

  return token;
}

module.exports = generateToken;
