const DOMAIN = 'localhost';
const PORT = process.env.PORT || 3000;

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
        returnUrl: `http://${DOMAIN}:${PORT}/auth/steam/return`,
        realm: `http://${DOMAIN}:${PORT}/`,
        apiKey: '706A63DB54661CEFD21620FB0CDE6586'
    },
    facebook: {
        callbackUrl: `http://${DOMAIN}:${PORT}/auth/facebook/callback`,
        appSecret: '318a826cdcfb3cd6a611b9024ca59a4b',
        appId: '1724095694547047'
    }
};