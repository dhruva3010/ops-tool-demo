const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const MicrosoftStrategy = require('passport-microsoft').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Local Strategy
passport.use(
  new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

        if (!user) {
          return done(null, false, { message: 'Invalid credentials' });
        }

        if (!user.password) {
          return done(null, false, { message: 'Please use OAuth to sign in' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
          return done(null, false, { message: 'Invalid credentials' });
        }

        if (!user.isActive) {
          return done(null, false, { message: 'Account is deactivated' });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Google Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ oauthId: profile.id, authProvider: 'google' });

          if (!user) {
            user = await User.findOne({ email: profile.emails[0].value });

            if (user) {
              user.oauthId = profile.id;
              user.authProvider = 'google';
              user.avatar = profile.photos[0]?.value;
              await user.save();
            } else {
              user = await User.create({
                email: profile.emails[0].value,
                name: profile.displayName,
                oauthId: profile.id,
                authProvider: 'google',
                avatar: profile.photos[0]?.value,
                role: 'employee',
              });
            }
          }

          if (!user.isActive) {
            return done(null, false, { message: 'Account is deactivated' });
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
}

// Microsoft Strategy
if (process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET) {
  passport.use(
    new MicrosoftStrategy(
      {
        clientID: process.env.MICROSOFT_CLIENT_ID,
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
        callbackURL: process.env.MICROSOFT_CALLBACK_URL,
        scope: ['user.read'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ oauthId: profile.id, authProvider: 'microsoft' });

          if (!user) {
            const email = profile.emails[0]?.value || `${profile.id}@microsoft.com`;
            user = await User.findOne({ email });

            if (user) {
              user.oauthId = profile.id;
              user.authProvider = 'microsoft';
              await user.save();
            } else {
              user = await User.create({
                email,
                name: profile.displayName,
                oauthId: profile.id,
                authProvider: 'microsoft',
                role: 'employee',
              });
            }
          }

          if (!user.isActive) {
            return done(null, false, { message: 'Account is deactivated' });
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
}

module.exports = passport;
