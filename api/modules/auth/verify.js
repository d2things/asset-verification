const schema = require('../database/schema'); 
const generateToken = require('./generateToken');

/**
 * Function to verify user information and generate JWT token
 * @param {Object} req - Request object containing user information in the body
 * @param {Object} res - Response object to send the response
 */
async function verify(req, res) {
  try {
    // Destructure required fields from request body
    const { userId, username, profile_picture, api_key } = req.body;

    // Retrieve environment-specific API key
    const env_key = process.env.env_key;

    // Validate required fields and API key
    if (!userId || userId === undefined) {
      return res.status(400).json({ error: 'userId is required.' });
    } else if (!username || username === undefined) {
      return res.status(400).json({ error: 'username is required.' });
    } else if (!profile_picture || profile_picture === undefined) {
      return res.status(400).json({ error: 'profile_picture is required.' });
    } else if (!api_key || api_key === undefined) {
      return res.status(400).json({ error: 'api_key is required.' });
    } else if (api_key != env_key) {
      return res.status(400).json({ error: 'Auth failed' });
    }

    // Check if user already exists in the database
    const existingUser = await schema.findOne({ userId });

    if (existingUser) {
      // If user exists, generate token and return it
      const token = generateToken(existingUser);
      res.status(200).json({ token });
      return;
    }

    // Create new user object if user doesn't exist
    const user = {
      username: username,
      userId: userId,
      profile_picture: profile_picture,
      wallet: "",
      dateConnected: new Date(),
    };

    // Insert new user into the database
    const user_info = await schema.insertMany([user]);

    // Generate token for the newly created user
    const token = generateToken(user);

    // Return the generated token in the response
    res.status(200).json({ token });
    return;

  } catch (error) {
    // Handle errors during user verification and token generation
    if (error.code === 11000 && error.keyPattern.email) {
      console.error('Email address is already in use.');
      res.status(400).json({ error: 'Email address is already in use.' });
    } else {
      console.error('Error during user verification:', error);
      res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
  }
}

module.exports = verify;
