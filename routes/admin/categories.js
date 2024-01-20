import express from 'express';
const router = express.Router();
import Category from '../../models/Category.js';

router.all('/*', (req, res, next)=>{
    req.app.locals.layout = 'admin';
    next();
});


router.get('/', (req, res)=>{
    Category.find({}).then(categories=>{
        res.render('admin/categories/index', {categories: categories});
    })
    
});

router.post('/create', (req, res)=>{
    const newCategory = Category({
        name: req.body.name
    });
    newCategory.save().then(savedCategory=>{
         res.redirect('/admin/categories');
    });
});

router.get('/edit/:id', (req, res)=>{
    Category.findOne({_id: req.params.id}).then(category=>{
        res.render('admin/categories/edit', {category: category});
    })
    
});

router.put('/edit/:id', (req, res)=>{
    Category.findOne({_id: req.params.id}).then(category=>{
        category.name = req.body.name;
        category.save().then(savedCategory=>{
            res.redirect('/admin/categories');
        });
    });
    
});

router.delete('/:id', (req,res)=>{
    Category.findByIdAndDelete({_id: req.params.id}).then(result=>{
        res.redirect('/admin/categories');
    }).catch(err=>{
        console.log(err);
    })
})

export default router;