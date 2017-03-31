import passport from 'passport';
import jwt from 'jsonwebtoken';
import config from './config';

export default (app) => {
    function jwtResponse(provider) {
        return (req, res, next) => {
            passport.authenticate(provider, (err, user, info) => {
                if (err) return next(err);
                if (!user) return next({error: 'User does not exists'});

                const token = jwt.sign({id: user._id}, config.secret, config.jwt);

                res.send(`
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="utf-8">
                        <title>LoggedIn</title>
                    </head>
                    <body>
                        <script>window.opener.onLogin(${JSON.stringify(token)}, ${JSON.stringify(user)}); window.close();</script>
                    </body>
                    </html>
                `)
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