const mongoose = require('mongoose');
const url = process.env.MONGO_URI;
const connect = async()=>{
     try{
          await mongoose.connect(url);
             console.log('mongoDB connected succsesfully')
     }
     catch(err)
   {console.error("mongoDB connection error",err)}
}
module.exports = connect;