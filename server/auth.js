import jwt from 'jsonwebtoken';
import config from './config';

export function generateToken(user) {
    return jwt.sign({id: user._id}, config.secret, config.jwt);
}