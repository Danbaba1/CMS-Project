import mongoose from 'mongoose';

const { Schema } = mongoose;
import URLSlugs from 'mongoose-url-slugs';


const postSchema = new Schema({

    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'categories'
    },
    title: {
        type: String,
        required: true
    },
     slug: {
        type: String
    },
    status: {
        type: String,
        default: 'public'
    },
    allowComments: {
        type: Boolean,
        required: true
    },
    body: {
        type: String,
        require: true
    },
    file: {
        type: String,
    },
    date: {
        type: Date,
        default: Date.now()
    },
   
    comments: [{
        type: Schema.Types.ObjectId,
        ref: 'comments'
    }]
        
}, {usePushEach: true});

postSchema.plugin(URLSlugs('title', {field: 'slug'}));
export default mongoose.model('posts', postSchema);

