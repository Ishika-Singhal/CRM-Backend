
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User'); // Import the User model

// Serialize user: Store the user's ID in the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user: Retrieve the user from the database using the stored ID
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Configure Google OAuth 2.0 Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID, // Your Google Client ID from .env
      clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Your Google Client Secret from .env
      callbackURL: process.env.GOOGLE_CALLBACK_URL, // Your Google Callback URL from .env
      proxy: true // Trust the proxy header (important for deployment)
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if a user with this Google ID already exists in our database
        let existingUser = await User.findOne({ googleId: profile.id });

        if (existingUser) {
          // If user exists, return that user
          console.log('Existing user logged in:', existingUser.email);
          done(null, existingUser);
        } else {
          // If user does not exist, create a new user
          const newUser = await new User({
            googleId: profile.id,
            displayName: profile.displayName,
            email: profile.emails && profile.emails[0] ? profile.emails[0].value : null,
            profilePicture: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
          }).save();
          console.log('New user created:', newUser.email);
          done(null, newUser);
        }
      } catch (err) {
        console.error('Error during Google OAuth callback:', err);
        done(err, null);
      }
    }
  )
);
