import mongoose from 'mongoose';

const feeSchema = new mongoose.Schema({
    student:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    date:{
        type: Date,
        required:true
    }
}, {timestamps: true})

const Fee = mongoose.model('Fee', feeSchema);

export default Fee;