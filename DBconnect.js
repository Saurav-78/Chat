//mongodb+srv://sauravpandit024_db_user:WhdB932LFIppgd3k@cluster0.j1yu1ic.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
const mongoose = require('mongoose');
const url = "mongodb+srv://sauravpandit024_db_user:WhdB932LFIppgd3k@cluster0.j1yu1ic.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const connect = async()=>{
     try{
          await mongoose.connect(url);
             console.log('mongoDB connected succsesfully')
     }
     catch(err)
   {console.error("mongoDB connection error",err)}
}
module.exports = connect;