import passport from 'passport';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import SteamStrategy from 'passport-steam';
import config from '../config';
import User, { findOrCreate } from '../model/user';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';

passport.use(new SteamStrategy({
    returnURL: config.steam.returnUrl,
    realm: config.steam.realm,
    apiKey: config.steam.apiKey
}, (identifier, profile, done) => {
    findOrCreate('steam', profile.id, profile.displayName, profile._json)
        .then((user) =>  done(null, user))
        .catch((err) => done(err, false));
}));

passport.use(new FacebookStrategy({
    clientID: config.facebook.appId,
    clientSecret: config.facebook.appSecret,
    callbackURL: config.facebook.callbackUrl
}, (accessToken, refreshToken, profile, done) => {
    findOrCreate('facebook', profile.id, profile.displayName, profile._json, { accessToken, refreshToken })
        .then((user) => done(null, user))
        .catch((err) => done(err, false));
}));

passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeader(),
    ...config.jwt,
    secretOrKey: config.secret,
    passReqToCallback: true
}, (req, payload, done) => {
    User
        .findById(payload.id).exec()
        .then((user) => {
            if (user) {
                if (ExtractJwt.fromAuthHeader()(req) != user.token) {
                    done(null, false);
                } else {
                    done(null, user)
                }
            } else {
                done(null, false)
            } 
        })
        .catch((err) => done(err, false))
}));

export default (app) => {
    app.use(passport.initialize());
    app.use(passport.session());
}
