const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    unique: true,
    sparse: true // Allows null values, useful if other auth methods are added later
  },
  displayName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    sparse: true, // Allows null values
    lowercase: true, // Stores emails in lowercase
    trim: true, // Removes whitespace
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'] // Basic email regex
  },
  profilePicture: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);