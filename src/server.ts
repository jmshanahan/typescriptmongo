import 'dotenv/config';

import App from './app';
import PostController from './posts/posts.controller';
import AuthenticationController from './authentication/authentication.controller';
import validateEnv from './utils/validateEnv';
validateEnv();

const app = new App([new PostController(), new AuthenticationController()]);
app.listen();
