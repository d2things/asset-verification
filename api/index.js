// Import required modules
const express = require('express');
require('dotenv').config();  // Load environment variables from .env file

// Dependencies
const cors = require('cors');  // Enable Cross-Origin Resource Sharing

// Database
const mongoose = require('mongoose');  // MongoDB ODM
const schema = require("./modules/database/schema");  // Database schema

// Authentication modules
const verify = require('./modules/auth/verify');  // Verify authentication
const verify_check = require('./modules/auth/verify_check');  // Verify check
const check_token_balance = require('./modules/auth/check_bio_balance');  // Check token balance
const verify_user = require('./modules/auth/verify_user');  // Verify user

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;  // Set the port from environment or default to 3001

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);  // Exit the process with failure code
  }
};

// Middleware setup
app.use(cors({
  origin: 'http://localhost:3000',  // Allow requests from this origin
  methods: 'GET, POST',  // Allow only GET and POST methods
  credentials: true,  // Allow credentials (cookies, authorization headers, etc.)
}));

// Default route for root path
app.all('/', (req, res) => {
  console.log("Just got a request!");
  res.send('200');  // Send a 200 OK response
});

// Middleware to parse JSON request bodies
app.use(express.json());

// Route to get all users
app.get('/get-users', async (req, res) => {
  const book = await schema.find();  // Find all entries in the schema

  if (book) {
    res.json(book);  // Send the found entries as JSON
  } else {
    res.send("Something went wrong.");  // Send an error message if something went wrong
  }
});

// Authentication routes
app.post('/verify', verify);  // Route to verify
app.post('/check_verify', verify_check);  // Route to check verification
app.post('/balance', check_token_balance);  // Route to check token balance
app.post('/verify_user', verify_user);  // Route to verify user

// Connect to database and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("listening for requests");
  });
});
