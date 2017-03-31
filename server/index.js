import express from 'express';
import passport from 'passport';
import SteamStrategy from 'passport-steam';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import errorHandler from 'api-error-handler';

import config from './config';

import passportMiddleware from './middleware/passport';
import routes from './routes';

const app = express();

app.set('port', config.port);

try {
  fs.statSync('dist');
  console.log('Serving static build from dist/');
  console.log('Run `npm run clean` to return to development mode');
  app.use('/', express.static(path.join(__dirname, '../dist')));
}
catch (e) {
  console.log('Serving development build with nwb middleware');
  console.log('Run `npm run build` to create a production build');
  app.use(require('nwb/express')(express));
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use((err, req, res, next) => {
  console.log(err);

  res.status(500).send({
    error: err
  })
})

passportMiddleware(app);
routes(app);


mongoose.connect(config.mongodb);

app.listen(app.get('port'), () => {
  console.log('Server started: http://localhost:' + app.get('port') + '/');
});