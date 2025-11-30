import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { envData } from './env.config.js';
import { IUserDocument, IUserQuery, User } from '../models/User.js';

passport.use(new GoogleStrategy({
    clientID: envData.GOOGLE_CLIENT_ID,
    clientSecret: envData.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:4000/api/v1/auth/google/callback',
    scope: ['profile', 'email'],
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // ** Extra check to make sure the users email exists ** \\
        const usersEmail = profile.emails![0].value;
        if (!usersEmail) {
            console.error("❌ No email in Google profile");
            return done(new Error('No email provided'), false);
        }
        // ** Handle user data from Google, find or create user in DB ** \\
        let user: unknown;

        // ** Initially find the user ** \\
        user = await User.findOne({ email: usersEmail })
            .lean<IUserQuery>();

        // ** Check if the user exists ** \\
        if (!user) {
            // ** Create the user if user wasnt found ** \\
            user = await User.create({
                fullname: profile.displayName,
                email: usersEmail,
                oAuthProviders: [
                    { provider: profile.provider, id: profile.id }
                ],
                avatar: profile?.photos![0].value || "https://img.freepik.com/premium-vector/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3407.jpg",
                creditRefillDate: new Date(),
            }); 

            return done(null, user as (Express.User & IUserDocument));
        } else {
            // ** Return user if their account was found ** \\
            return done(null, user as (Express.User & IUserDocument));
        }
    } catch (err) {
        console.error('Error in Google strategy:', err);
        return done(err, false);
    }
}));

export default passport