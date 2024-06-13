const jwt = require('jsonwebtoken');
const schema = require('../database/schema'); 
const Web3 = require('web3');
const bio_abi = require('./bio_abi.json');
const axios = require('axios');

// Initialize Web3 with your preferred provider (e.g., Infura, local node)
const web3 = new Web3('https://mainnet.infura.io/v3/fb43b5a5ec81406c90cbbeb12cda191a');

// Contract address and ABI for BIOP token
const BIOP_ADDRESS = '0x0d2ADB4Af57cdac02d553e7601456739857D2eF4';
const biopAbi = bio_abi;

// Instantiate the BIOP token contract
const biopContract = new web3.eth.Contract(biopAbi, BIOP_ADDRESS);

/**
 * Function to check BIOP token balance in a wallet
 * @param {string} walletAddress - Wallet address to check the balance
 * @returns {Object} Object containing BIOP balance and a boolean indicating if the balance is greater than zero
 */
async function checkBIOPBalance(walletAddress) {
    try {
        // Get the balance of BIOP tokens in the wallet
        const balance = await biopContract.methods.balanceOf(walletAddress).call();
        
        // Convert the balance to a readable format (assuming BIOP token has 18 decimals)
        const biopBalance = parseFloat(balance) / 10 ** 18;
        
        // Log BIOP balance for debugging (can be removed in production)
        console.log('BIOP Balance:', biopBalance);
        
        // Return BIOP balance and a boolean indicating if the balance is greater than zero
        return { biopBalance: biopBalance, balBool: true };
    } catch (error) {
        // Handle errors during BIOP balance checking
        console.error('Error checking BIOP balance:', error);
        throw error;
    }
}

/**
 * Function to verify wallet signature against nonce and update user data
 * @param {string} address - Wallet address to verify against recovered address
 * @param {string} nonce - Nonce used in the message for signature verification
 * @param {string} signature - Signature to verify against the message
 * @returns {number} HTTP status code indicating the result of signature verification
 */
async function verifySignature(address, nonce, signature) {
    const message = `Verify Your Wallet (GASLESS) \n$CRYO VERIFICATION \n${nonce}`;
    
    // Recover the address from the provided signature
    let recoveredAddress = web3.eth.accounts.recover(message, signature);
    
    // Log recovered and provided addresses for debugging (can be removed in production)
    console.log('Message:', message);
    console.log('Provided Address:', address);
    console.log('Recovered Address:', recoveredAddress);

    // Compare recovered address with provided address
    if (recoveredAddress.toUpperCase() !== address.toUpperCase()) {
        // Failed signature verification
        return 400;
    }

    // Replace * with . in the nonce to decode the JWT token
    const replacedToken = nonce.replace(/\*/g, '.');
    const jwtSecretKey = process.env.JWT_SECRET;

    // Verify the decoded JWT token
    try {
        const decoded = jwt.verify(replacedToken, jwtSecretKey);
        console.log('Decoded JWT:', decoded);

        // Extract userId from decoded JWT token
        const userId = decoded.userId;

        // Find user with the recovered wallet address
        const existingUser = await schema.findOne({ wallet: recoveredAddress });

        // Check if the recovered wallet address is already in use by another user
        if (existingUser && existingUser.userId !== userId) {
            console.error('Wallet address is already in use by another user');
            return 403;
        }

        // Update the user's wallet address in the database
        const user = await schema.findOneAndUpdate(
            { userId: userId },
            { wallet: recoveredAddress },
            { new: true, runValidators: true }
        );

        // Handle case where user is not found in the database
        if (!user) {
            console.error('User not found');
            return 404;
        }

        // Successfully updated the user's wallet address
        return 200;
    } catch (err) {
        // Handle errors during JWT verification or database operations
        console.error('Error:', err.message);
        return 400;
    }
}

/**
 * Function to add a specific role to a user in Discord guild
 * @param {string} userID - User ID to add the role
 */
async function addRole(userID) {
    const guildId = '1190905181274120272'; // Replace with your guild ID
    const userId = userID; // Replace with the user ID
    const roleId = '1210745597292716072'; // Replace with the role ID
    const token = 'MTE5MTAxMjg5MjcwMzcyMzY2Mg.G0eV8W.D7rhpOK3S82xHyPM-Y26jCWz0EM5ur7NrPZeSs'; // Replace with your Discord bot token

    try {
        // Fetch the current roles of the user
        const response = await axios.get(`https://discord.com/api/v9/guilds/${guildId}/members/${userId}`, {
            headers: {
                Authorization: `Bot ${token}`
            }
        });

        // Get the current roles and add the new role if it's not already present
        const currentRoles = response.data.roles;
        if (!currentRoles.includes(roleId)) {
            currentRoles.push(roleId);

            // Update the user's roles
            await axios.patch(`https://discord.com/api/v9/guilds/${guildId}/members/${userId}`, {
                roles: currentRoles
            }, {
                headers: {
                    Authorization: `Bot ${token}`
                }
            });

            console.log('Role added successfully');
        } else {
            console.log('User already has the role');
        }
    } catch (error) {
        // Handle errors during role addition
        console.error('Error adding role:', error.response ? error.response.data : error.message);
    }
}

/**
 * Middleware function to verify user data including BIOP balance and signature
 * @param {Object} req - Request object containing token, address, nonce, and signature in the body
 * @param {Object} res - Response object to send the response
 */
async function verify_user(req, res) {
    try {
        // Destructure token, address, nonce, and signature from request body
        const { token, address, nonce, signature } = req.body;
        
        // Replace * with . in the token to decode the JWT token
        let replacedToken;
        if (token) {
            replacedToken = token.replace(/\*/g, '.');
        } else {
            console.error('Token is undefined');
        }
        
        // Retrieve JWT secret key from environment variables
        const jwtSecretKey = process.env.JWT_SECRET;

        // Verify the decoded JWT token
        jwt.verify(replacedToken, jwtSecretKey, async (err, decoded) => {
            if (err) {
                // Handle token verification error
                console.error(err);
                return res.status(401).json({ error: 'Token Invalid' });
            } else {
                // Extract userId from decoded JWT token
                req.user = decoded;
                console.log('Decoded User:', decoded);
                const userId = req.user.userId;

                // Find user in the database based on userId
                const user = await schema.findOne({ userId });
        
                // Handle case where user is not found in the database
                if (!user) {
                    return res.status(404).json({ error: 'Unknown User' });
                } else if (err) {
                    return res.status(403).json({ error: 'User Could Not Be Found' });
                }

                // Check if the wallet holds BIOP tokens
                const holdsBIOP = await checkBIOPBalance(address);
                console.log('BIOP Balance:', holdsBIOP.biopBalance);

                // Handle case where wallet does not hold BIOP tokens
                if (holdsBIOP.biopBalance == 0) {
                    console.log('No BIOP Found');
                    return res.status(403).json({ error: 'Wallet does not hold BIOP' });
                }

                // Verify wallet signature against nonce and update user data
                const signatureSign = await verifySignature(address, nonce, signature);
                console.log('Signature Verification:', signatureSign);

                // Handle different HTTP status codes based on signature verification result
                if (signatureSign === 200) {
                    // Add a specific role to the user in Discord guild
                    addRole(user.userId);

                    // Construct user data object to return in the response
                    const userData = {
                        username: user.username,
                        userId: user.userId,
                        profile_picture: user.profile_picture,
                        wallet: user.wallet,
                    };

                    // Update user's data in the database
                    const updatedUser = await schema.findOneAndUpdate(
                        { userId: user.userId },
                        { $set: userData },
                        { new: true }
                    );

                    // Respond with success message
                    return res.status(200).json({ message: 'Success' });
                } else if (signatureSign === 400) {
                    // Handle case where signature verification fails
                    return res.status(403).json({ error: 'Invalid Signature' });
                } else {
                    // Handle other cases where an error occurred during signature verification
                    return res.status(403).json({ error: 'An error occurred' });
                }
            }
        });
    } catch (error) {
        console.error('Error verifying user data:', error);
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
};

module.exports = verify_user;