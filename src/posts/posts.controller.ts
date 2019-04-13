import express from 'express';
import validationMiddleware from '../middleware/validation.middleware';
import RequestWithUser from '../interfaces/requestWithUser.interface';
import authMiddleware from '../middleware/auth.middleware';
import CreatePostDto from './post.dto';
import Post from './post.interface';
import Controller from '../interfaces/controller.interface';
import postModel from './posts.model';
import HttpException from '../exceptions/HttpException';
import PostNotFoundException from '../exceptions/PostNotFoundException';
import mongoose from 'mongoose';
class PostController implements Controller {
  public path = '/posts';
  public router = express.Router();
  private post = postModel;

  constructor() {
    this.intializeRoutes();
  }
  public intializeRoutes() {
    this.router.get(this.path, this.getAllPosts);
    this.router.get(`${this.path}/:id`, this.getPostById);
    this.router
      .all(`${this.path}/*`, authMiddleware)
      .patch(
        `${this.path}/:id`,
        validationMiddleware(CreatePostDto, true),
        this.modifyPost
      )
      .delete(`${this.path}/:id`, this.deletePost)
      .post(
        this.path,
        authMiddleware,
        validationMiddleware(CreatePostDto),
        this.createPost
      );
  }
  private getAllPosts = async (
    request: express.Request,
    response: express.Response
  ) => {
    const posts = await this.post.find().populate('author', '-password');
    response.send(posts);
  };

  private getPostById = (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const id = request.params.id;
    if (mongoose.Types.ObjectId.isValid(id)) {
      this.post
        .findById(id)
        .then(post => {
          if (post) {
            response.send(post);
          } else {
            next(new PostNotFoundException(id));
          }
        })
        .catch(err => new HttpException(404, 'No post found'));
    } else {
      next(new HttpException(404, `${id} is not a valid mongodb ID`));
    }
  };
  private modifyPost = (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const id = request.params.id;
    const postData: Post = request.body;
    this.post.findByIdAndUpdate(id, postData, { new: true }).then(post => {
      if (post) {
        response.send(post);
      } else {
        next(new PostNotFoundException(id));
      }
    });
  };
  private createPost = async (
    request: RequestWithUser,
    response: express.Response
  ) => {
    const postData: Post = request.body;
    const createPost = new this.post({
      ...postData,
      author: request.user._id
    });
    const savedPost = await createPost.save();
    await savedPost.populate('author', '-password').execPopulate();
    response.send(savedPost);
  };
  private deletePost = (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const id = request.params.id;
    this.post.findByIdAndDelete(id).then(successResponse => {
      if (successResponse) {
        response.send(200);
      } else {
        next(new PostNotFoundException(id));
      }
    });
  };
}
export default PostController;
