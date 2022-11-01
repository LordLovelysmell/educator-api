const mongoose = require('mongoose');

const ImageSchema = mongoose.Schema({
    fieldname: String,
    originalname: String,
    encoding: String,
    mimetype: String,
    destination: String,
    filename: String,
    path: String,
    size: Number
})

const CourseSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: ImageSchema
    },
    isCompleted: Boolean,
    startDate: Date,
    endDate: Date,
})

module.exports = mongoose.model('Course', CourseSchema);