const DOMAIN = 'localhost';
const PORT = process.env.PORT || 3000;
const CALLBACK_URL = process.env.CALLBACK_URL || `http://${DOMAIN}:${PORT}`;

export default {
    domain: DOMAIN,
    port: PORT,
    mongodb: process.env.MONGODB_URI || `mongodb://${DOMAIN}:28001`,
    secret: 'sample123456',
    jwt: {
        issuer: 'me@sample',
        audience: DOMAIN
    },
    steam: {
        returnUrl: `${CALLBACK_URL}/auth/steam/return`,
        realm: `${CALLBACK_URL}`,
        apiKey: process.env.STEAM_API_KEY || '706A63DB54661CEFD21620FB0CDE6586'
    },
    facebook: {
        callbackUrl: `${CALLBACK_URL}/auth/facebook/callback`,
        appSecret: process.env.FACEBOOK_APP_SECRET || '318a826cdcfb3cd6a611b9024ca59a4b',
        appId: process.env.FACEBOOK_APP_ID || '1724095694547047'
    }
};