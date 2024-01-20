import express from 'express';
const router = express.Router();
import Post from '../../models/Post.js';
import Comment from '../../models/Comment.js';

router.all('/*', (req, res, next) => {
    req.app.locals.layout = 'admin';
    next();
})


router.get('/', (req, res) => {
    Comment.find({user: req.user}).populate('user').then(comments => {
        res.render('admin/comments', {comments: comments});
    });

});

router.post('/', (req, res) => {
    Post.findOne({_id: req.body.id }).then(post => {
        const newComment = new Comment({
            user: req.user.id,
            body: req.body.body
        });
        post.comments.push(newComment);
        post.save().then(savedPost => {
            newComment.save().then(savedComment => {
                req.flash('success_message', 'Your comment will be reviewd in a moment');
                res.redirect(`/post/${post._id}`);
            });
        });
    });
});

router.delete('/:id', (req, res)=>{
    Comment.findByIdAndDelete({_id:req.params.id}).then(deleteId=>{
        Post.findOneAndUpdate({comments: req.params.id}, {$pull: {comments: req.params.id}}).then((err,data)=>{
            if(err) console.log(err);
            res.redirect('/admin/comments');
        });
        
    });
});

router.post('/approve-comment', (req,res)=>{
    Comment.findByIdAndUpdate(req.body.id, {$set: {approveComment: req.body.approveComment}}).then(result=>{
       res.send(result);
    }).catch(err=>{
        console.log(err);
    })
});



export default router;