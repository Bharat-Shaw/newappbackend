const mongoose=require('mongoose');

const connection=mongoose.connect('mongodb+srv://newmobapp:newmobapp1234@newapp.fdpldjx.mongodb.net/?retryWrites=true&w=majority');

module.exports={connection};