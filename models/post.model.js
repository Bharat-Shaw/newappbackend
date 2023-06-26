const mongoose = require('mongoose');

const postschema = mongoose.Schema({
    title: { type: String, required: true },
    body: { type: String, required: true },
    device: { type: String }
})

const Postmodel=mongoose.model('post', postschema);

module.exports={Postmodel}