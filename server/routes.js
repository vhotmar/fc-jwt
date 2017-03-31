import passport from 'passport';
import {generateToken} from './auth';

export default (app) => {
    function jwtResponse(provider) {
        return (req, res, next) => {
            passport.authenticate(provider, (err, user, info) => {
                if (err) return next(err);
                if (!user) return next({error: 'User does not exists'});

                const sendResponse = (user) => res.send(`
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="utf-8">
                        <title>LoggedIn</title>
                    </head>
                    <body>
                        <script>window.opener.onLogin(${JSON.stringify(user.token)}, ${JSON.stringify(user)}); window.close();</script>
                    </body>
                    </html>
                `);

                if (user.token == null) {
                    user.token = generateToken(user);

                    user
                        .save()
                        .then(sendResponse)
                        .catch(next);
                } else {
                    sendResponse(user);
                }
            })(req, res, next);
        }
    }

    function auth() {
        return passport.authenticate('jwt', {session: false});
    }

    app.get('/auth/steam', passport.authenticate('steam'));
    app.get('/auth/steam/return', jwtResponse('steam'));

    app.get('/auth/facebook', passport.authenticate('facebook'));
    app.get('/auth/facebook/callback', jwtResponse('facebook'));

    app.get('/api/secure', auth(), (req, res) => {
        res.json({
            message: 'Success :)',
            user: req.user
        })
    });
}