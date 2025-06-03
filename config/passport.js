
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID, 
      clientSecret: process.env.GOOGLE_CLIENT_SECRET, 
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      proxy: true 
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
      
        let existingUser = await User.findOne({ googleId: profile.id });

        if (existingUser) {
        
          console.log('Existing user logged in:', existingUser.email);
          done(null, existingUser);
        } else {
          
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
