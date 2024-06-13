const jwt = require('jsonwebtoken');
const schema = require('../database/schema'); 

// Secret key for verifying JWT tokens
const jwtSecretKey = process.env.JWT_SECRET;

/**
 * Function to verify the token and return user data
 * @param {Object} req - Request object containing the token in the body
 * @param {Object} res - Response object to send the response
 */
async function verify_check(req, res) {
  try {
    // Extract token from the request body
    const token = req.body.token;

    // Replace '*' with '.' in the token to format it correctly
    let replacedToken;
    if (token) {
      replacedToken = token.replace(/\*/g, '.');
    } else {
      console.error('Token is undefined');
      return res.status(400).json({ error: 'Token is undefined' });
    }

    // Verify the JWT token
    jwt.verify(replacedToken, jwtSecretKey, async (err, decoded) => {
      if (err) {
        // Handle token verification error
        console.error('Token verification error:', err);
        return res.status(401).json({ error: 'Token Invalid' });
      }

      // Extract user information from the decoded token
      req.user = decoded;
      const userId = req.user.userId;

      // Find the user in the database by userId
      const user = await schema.findOne({ userId });

      if (!user) {
        return res.status(404).json({ error: 'Unknown User' });
      }

      // Prepare user data to send in the response
      const userData = {
        username: user.username,
        userId: user.userId,
        profile_picture: user.profile_picture,
        wallet: user.wallet,
      };

      // Send the user data in the response
      return res.json(userData);
    });
  } catch (error) {
    console.error('Error verifying user data:', error);
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
}

module.exports = verify_check;
