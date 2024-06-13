const jwt = require('jsonwebtoken');
const schema = require('../database/schema'); 
require('dotenv').config();
const Web3 = require('web3');

// Initialize Web3 with your preferred provider (e.g., Infura, local node)
const web3 = new Web3('https://mainnet.infura.io/v3/fb43b5a5ec81406c90cbbeb12cda191a');

// Token contract address
const TOKEN_ADDRESS = '0x0d2ADB4Af57cdac02d553e7601456739857D2eF4';

// ABI for the token contract
const contract_abi = require('./bio_abi.json');
const TOKEN_ABI = contract_abi;

// Instantiate the token contract
const tokenContract = new web3.eth.Contract(TOKEN_ABI, TOKEN_ADDRESS);

// Function to check token balance in a wallet
async function checkTokenBalance(walletAddress) {
    try {
        // Get the balance of the token in the wallet
        const balance = await tokenContract.methods.balanceOf(walletAddress).call();

        // Convert the balance to a readable format (assuming the token has 18 decimals)
        const tokenBalance = parseFloat(balance) / 10 ** 18;

        // Determine if the wallet has any tokens
        const balBool = tokenBalance > 0;
        return { tokenBalance, balBool };
    } catch (error) {
        console.error('Error checking token balance:', error);
        throw error;
    }
}

// Middleware to check token balance and verify user
async function check_token_balance(req, res) {
    try {
        const { token, address } = req.body;

        // Replace asterisks with dots in the token, if applicable
        let replacedToken;
        if (token) {
            replacedToken = token.replace(/\*/g, '.');
        } else {
            console.error('Token is undefined');
            return res.status(400).json({ error: 'Token is undefined' });
        }
        
        const jwtSecretKey = process.env.JWT_SECRET;

        // Verify the JWT token
        jwt.verify(replacedToken, jwtSecretKey, async (err, decoded) => {
            if (err) {
                return res.status(401).json({ error: 'Token Invalid' });
            } else {
                req.user = decoded;
                const userId = req.user.userId;

                // Find user in the database
                const user = await schema.findOne({ userId });
            
                if (!user) {
                    return res.status(404).json({ error: 'Unknown User' });
                } else if (err) {
                    return res.status(403).json({ error: 'User Could Not Be Found' });
                }

                const userData = {
                    username: user.username,
                    userId: user.userId,
                    profile_picture: user.profile_picture,
                    wallet: user.wallet,
                };

                // Validate wallet address
                const walletRegex = /^(0x)?[0-9a-fA-F]{40}$/;
                if (!walletRegex.test(address)) {
                    return res.status(400).json({ error: 'Invalid wallet address' });
                }
                
                // Check the balance of the specified token
                const tokenBalance = await checkTokenBalance(address);
                
                if (!tokenBalance.balBool) {
                    return res.status(403).json({ balance: tokenBalance.tokenBalance, hasBal: tokenBalance.balBool });
                }
                
                // Respond with the token balance if everything is fine
                return res.status(200).json({ balance: tokenBalance.tokenBalance, hasBal: tokenBalance.balBool });
            }
        });
    } catch (error) {
        console.error('Error verifying user data:', error);
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
}

module.exports = check_token_balance;
