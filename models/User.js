import mongoose from 'mongoose';

const { Schema } = mongoose;

const UserSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
});

UserSchema.methods.testMethod = function(){
    console.log('using schema methods');
}

export default mongoose.model('users', UserSchema);
