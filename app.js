import express from 'express';
import path from 'path';
import { engine } from 'express-handlebars';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import upload from 'express-fileupload';
import session from 'express-session';
import flash from 'connect-flash';
import { mongoDbUrl } from './config/database.js';
import passport from 'passport';
import { allowInsecurePrototypeAccess } from '@handlebars/allow-prototype-access';
import Handlebars from 'handlebars';
import { fileURLToPath } from 'url';




const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express()

mongoose.set('strictQuery', false);

mongoose.connect(mongoDbUrl).then(() => {
    console.log('Connected to MongoDB');
  }).catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });




app.use(express.static(path.join(__dirname, 'public')));

// Set View Engine

import { select, generateDate, paginate } from './helpers/handlebars-helpers.js';
app.engine('handlebars', engine({
    handlebars: allowInsecurePrototypeAccess(Handlebars), defaultLayout: 'home',
    helpers: { select: select, generateDate: generateDate, paginate: paginate }
}));
app.set('view engine', 'handlebars');

// Upload Middleware

app.use(upload());

// Body Parser

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Method Override

app.use(methodOverride('_method'));

// Use express-session middleware
app.use(session({
    secret: 'your-secret-key',
    resave: true,
    saveUninitialized: true
}));
app.use(flash());

// PASSPORT

app.use(passport.initialize());
app.use(passport.session());

// Local variables using Middleware

app.use((req, res, next) => {

    res.locals.user = req.user || null;
    res.locals.success_message = req.flash('success_message');
    res.locals.error_message = req.flash('error_message');
    res.locals.form_errors = req.flash('form_errors');
    res.locals.error = req.flash('error');

    next();

});

// Load Routes

import home from './routes/home/index.js';
import admin from './routes/admin/index.js';
import posts from './routes/admin/posts.js';
import categories from './routes/admin/categories.js';
import comments from './routes/admin/comments.js';


// Use Routes

app.use('/', home);
app.use('/admin', admin);
app.use('/admin/posts', posts);
app.use('/admin/categories', categories);
app.use('/admin/comments', comments);

app.listen(4500, () => {

    console.log(`listening on port 4500`);

});