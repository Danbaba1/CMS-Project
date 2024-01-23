import express from 'express';
const router = express.Router();
import faker from 'faker';
import Post from '../../models/Post.js';
import Category from '../../models/Category.js';
import Comment from '../../models/Comment.js';
import { userAuthenticated } from '../../helpers/authentication.js';

router.all('/*', /*userAuthenticated*/(req, res, next) => {

    req.app.locals.layout = 'admin';
    next();

});


router.get('/', (req, res) => {

    const promises = [
        Post.count().exec(),
        Category.count().exec(),
        Comment.count().exec()
    ];

    Promise.all(promises).then(([postCount, categoryCount, commentCount])=>{
         res.render('admin/index', {postCount: postCount, categoryCount: categoryCount, commentCount: commentCount});
    });



    // Post.countDocuments({}).then(postCount=>{
    //      res.render('admin/index', {postCount: postCount});
    // });

});

router.post('/generate-fake-posts', async (req, res) => {
    const postToSave = [];

    for (let i = 0; i < req.body.amount; i++) {

        let post = new Post();

        post.title = faker.name.title();
        post.status = 'public';
        post.allowComments = faker.datatype.boolean();
        post.slug = faker.name.title()
        post.body = faker.lorem.sentence();

        postToSave.push(post.save());
    }
    const savedPosts = await Promise.all(postToSave);
    res.redirect('/admin/posts');
});

export default router;