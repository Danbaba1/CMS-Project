import express from 'express';
const router = express.Router();
import Post from '../../models/Post.js';
import Category from '../../models/Category.js';
import User from '../../models/User.js';
import bcrpyt from 'bcryptjs';
import passport from 'passport';
import LocalStrategy from 'passport-local';
// const {LocalStrategy} = passportLocal;
import slug from 'slug';

router.all('/*', (req, res, next) => {

    req.app.locals.layout = 'home';
    next();

});

router.get('/', (req, res) => {

    const perPage = 10;
    const page = req.query.page || 1;

    Post.find({}).
        skip((perPage * page) - perPage)
        .limit(perPage)
        .then(posts => {

            Post.count().then(postCount => {
                Category.find({}).then(categories => {
                    res.render('home/index', { 
                        posts: posts, 
                        categories: categories,
                        current: parseInt(page),
                        pages: Math.ceil(postCount/perPage),
                    });
                });
            });

        });

});

router.get('/about', (req, res) => {

    res.render('home/about');

});

router.get('/login', (req, res) => {

    res.render('home/login');

});

passport.use(new LocalStrategy({
    usernameField: 'email'
}, (email, password, done) => {
    User.findOne({ email: email }).then(user => {
        if (!user) return done(null, false, { message: 'No user found' });
        bcrpyt.compare(password, user.password, (err, matched) => {
            if (err) return err;
            if (matched) {
                return done(null, user);
            } else {
                return done(null, false, { message: 'Incorrect password' });
            }
        })
    });
}
));

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id).then(user => {
        done(null, user);
    }).catch(err => {
        done(err, null);
    });
});


router.post('/login', (req, res, next) => {

    passport.authenticate('local', {
        successRedirect: '/admin',
        failureRedirect: '/login',
        failureFlash: true
    })(req, res, next);

});

router.get('/logout', function (req, res) {
    // Perform any additional tasks before logging out, if needed

    // Call the logout function with a callback
    req.logout(function (err) {
        if (err) {
            // Handle error, if any
            return res.status(500).send("Error logging out");
        }

        // Redirect or send a response after successful logout
        res.redirect('/login'); // Redirect to the login page, for example
    });
});


router.get('/register', (req, res) => {

    res.render('home/register');

});

router.post('/register', (req, res) => {
    let errors = [];

    if (!req.body.firstName) {
        errors.push({ message: 'please enter your first name' });
    }
    if (!req.body.lastName) {
        errors.push({ message: 'please add a last name' });
    }
    if (!req.body.email) {
        errors.push({ message: 'please add an email' });
    }
    if (!req.body.password) {
        errors.push({ message: 'please enter a password' });
    }
    if (!req.body.passwordConfirm) {
        errors.push({ message: 'This field cannot be blank' });
    }
    if (req.body.password !== req.body.passwordConfirm) {
        errors.push({ message: "Password fields don't match" });
    }

    if (errors.length > 0) {
        res.render('home/register', {
            errors: errors,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email
        });
    } else {
        User.findOne({ email: req.body.email }).then(user => {
            if (!user) {
                const newUser = new User({
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    email: req.body.email,
                    password: req.body.password
                });

                bcrpyt.genSalt(10, (err, salt) => {
                    bcrpyt.hash(newUser.password, salt, (err, hash) => {
                        newUser.password = hash;
                        newUser.save().then(savedUser => {
                            req.flash('success_message', 'You are now registered, please login.');
                            res.redirect('/login');
                        });
                    });
                });

            } else {
                req.flash('error_message', 'That email exists please login.');
                res.redirect('/login');
            }
        });

    }

});

router.get('/post/:slug', (req, res) => {

    Post.findOne({ slug: req.params.slug }).populate({ path: 'comments', match: { approveComment: true }, populate: { path: 'user', model: 'users' } })
        .populate('user')
        .then(post => {
            Category.find({}).then(categories => {
                res.render('home/post', { post: post, categories: categories });
            });

        });

});

export default router;