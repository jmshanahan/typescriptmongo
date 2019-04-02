import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import Controller from './interfaces/controller.interface';

class App {
  public app: express.Application;
  public port: number;
  constructor(controllers: Controller[], port: number) {
    this.app = express();
    this.port = port;
    this.initializeMiddlewares();
    this.initializeControllers(controllers);
  }
  private initializeMiddlewares() {
    this.app.use(bodyParser.json());
  }
  private initializeControllers(controllers: any) {
    controllers.forEach(controller => {
      this.app.use('/', controller.router);
    });
  }
  public listen() {
    this.app.listen(this.port, () => {
      console.log(`App listening on the port ${this.port}`);
    });
  }
  private connectToTheDatabase() {
    const { MONGO_USER, MONGO_PASSWORD, MONGO_PATH } = process.env;
    mongoose.connect(`mongodb://${MONGO_USER}:${MONGO_PASSWORD}${MONGO_PATH}`);
  }
}
export default App;
