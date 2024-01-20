import express from 'express';
const router = express.Router();
import Post from '../../models/Post.js';
import Category from '../../models/Category.js';
import { isEmpty, uploadDir } from '../../helpers/upload-helper.js';
import fs from 'fs';
// const util = require('util');
// const unlinkAsync = util.promisify(fs.unlink);
// const { userAuthenticated } = require('../../helpers/authentication');
// const { resolve } = require('path');
import Comment from '../../models/Comment.js';

router.all('/*', /*userAuthenticated*/(req, res, next) => {

    req.app.locals.layout = 'admin';
    next();

});

router.get('/', (req, res) => {

    Post.find({}).populate('category').then(posts => {
        res.render('admin/posts', { posts: posts });
    });

});

router.get('/my-posts', (req, res) => {

    Post.find({ user: req.user.id })
        .populate('category')
        .then(posts => {

            res.render('admin/posts/my-posts', { posts: posts });
        })

});

router.get('/create', (req, res) => {

    Category.find({}).then(categories => {
        res.render('admin/posts/create', { categories: categories });
    });
});

router.post('/create', (req, res) => {

    let errors = [];

    if (!req.body.title) {
        errors.push({ message: 'please add a title' });
    }
    if (!req.body.status) {
        errors.push({ message: 'please add a status' });
    }
    if (!req.body.body) {
        errors.push({ message: 'please add a description' });
    }

    if (errors.length > 0) {
        res.render('admin/posts/create', {
            errors: errors
        });
    } else {
        let filename = 'Dogde.avif';

        if (!isEmpty(req.files)) {
            let file = req.files.file;
            filename = Date.now() + '_' + file.name;

            let dirUploads = './public/uploads/';

            file.mv(dirUploads + filename, (err) => {

                if (err) throw err;

            });
        }




        let allowComments = true;

        if (req.body.allowComments) {
            allowComments = true;
        } else {
            allowComments = false;
        }

        const newPost = new Post({

            user: req.user.id,
            title: req.body.title,
            status: req.body.status,
            allowComments: Boolean(req.body.allowComments),
            body: req.body.body,
            category: req.body.category,
            file: filename

        });




        newPost.save().then(savedPost => {

            req.flash('success_message', `Post ${savedPost.title} was created successfully`);

            res.redirect('/admin/posts');

        }).catch(error => {
            console.log('could not save post', error);
        });

    }


});

router.get('/edit/:id', (req, res) => {

    Post.findOne({ _id: req.params.id }).then(post => {
        Category.find({}).then(categories => {
            res.render('admin/posts/edit', { post: post, categories: categories });
        });
    });

});

router.put('/edit/:id', (req, res) => {

    Post.findOne({ _id: req.params.id }).then(post => {

        if (req.body.allowComments) {
            allowComments = true;
        } else {
            allowComments = false;
        }

        post.user = req.user.id;
        post.title = req.body.title;
        post.status = req.body.status;
        post.allowComments = Boolean(req.body.allowComments);
        post.body = req.body.body;
        post.category = req.body.category;


        if (!isEmpty(req.files)) {
            let file = req.files.file;
            let filename = Date.now() + '_' + file.name;
            post.file = filename;

            let dirUploads = './public/uploads/';

            file.mv(dirUploads + filename, (err) => {

                if (err) throw err;

            });
        }

        post.save().then(updatedPost => {

            req.flash('success_message', 'Post was successfully updated');

            res.redirect('/admin/posts/my-posts');
        });
    });
});


router.delete('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('comments');

    if (!post) {
      req.flash('error_message', 'Post not found');
      return res.redirect('/admin/posts');
    }

    // Delete comments associated with the post
    if (post.comments.length > 0) {
      const commentIds = post.comments.map(comment => comment._id);
      await Comment.deleteMany({ _id: { $in: commentIds } });
    }

    // Delete the post file (assuming `post.file` contains the filename)
    fs.unlink(uploadDir + post.file, (err) => {
      if (err) {
        console.error('Error deleting post file:', err.message);
      }
    });

    // Delete the post
    await Post.findByIdAndDelete(req.params.id);

    req.flash('success_message', 'Post and comments were successfully deleted');
    res.redirect('/admin/posts/my-posts');
  } catch (error) {
    console.error('Error deleting post and comments:', error.message);
    req.flash('error_message', 'An error occurred while deleting the post and comments');
    res.redirect('/admin/posts');
  }
});


export default router;

