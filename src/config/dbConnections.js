const mongoose=require("mongoose");
const dotenv=require("dotenv");
dotenv.config();

const connection=mongoose.connect(process.env.MONGO_URL).then(()=>{
    console.log("connect db successfully")
}).catch((err)=>{
    console.log("erroe in connection",err)
})

module.exports=connection;


