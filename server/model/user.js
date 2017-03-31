import mongoose, { Schema } from 'mongoose';
import {generateToken} from '../auth';

export const UserSchema = new Schema({
    name: String,
    token: String,
    auth: {
        // Each provider should be id and profile
        facebook: {
            id: String,
            accessToken: String,
            refreshToken: String,
            profile: Schema.Types.Mixed
        },
        steam: {
            id: String,
            profile: Schema.Types.Mixed
        }
    }
});

const unique = { unique: true, partialFilterExpression: { houseName: { $type: "string" } } };

UserSchema.path('auth.facebook.id').index(unique);
UserSchema.path('auth.steam.id').index(unique);

const UserModel = mongoose.model('User', UserSchema);

export function findOrCreate(provider, id, name, profile = {}, additional = {}) {
    return UserModel
        .findOne({ [`auth.${provider}.id`]: id })
        .exec()
        .then(user => {
            if (!user) {
                const token = generateToken(user);

                return UserModel
                    .create({
                        name,
                        token,
                        auth: { [provider]: { ...additional, id, profile } }
                    });
            } else {
                if (user.token == null) {
                    user.token = generateToken(user);

                    return user.save();
                }

                return user;
            }
        });
}

export default UserModel;