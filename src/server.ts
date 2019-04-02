import mongoose from 'mongoose';
import 'dotenv/config';
const { MONGO_USER, MONGO_PASSWORD, MONGO_PATH } = process.env;
console.log(`MONGO_USER= ${MONGO_USER} MONGO_PASSWORD = ${MONGO_PASSWORD}`);
const conn = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}${MONGO_PATH}`;
console.log(`Conn string = ${conn}`);
mongoose.connect(conn, {
  useNewUrlParser: true
});

import App from './app';
import PostController from './posts/posts.controller';
import validateEnv from './utils/validateEnv';
validateEnv();

const app = new App([new PostController()], 5000);
app.listen();
