import mongoose from 'mongoose';

const studentSchema =new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: [5, 'Username must be at least 5 characters'],
        maxlength: [20, 'Username must not exceed 20 characters']
    },
    class: {
        type:String,
        required:true
    },
    rollNo: {
        type: Number,
        required: true
    }
}, { timestamps: true})

const Student = mongoose.model('Student', studentSchema);

export default Student;