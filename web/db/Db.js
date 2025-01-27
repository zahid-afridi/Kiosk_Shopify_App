import mongoose from "mongoose";

const DbConnection=async()=>{
    try {
        // await mongoose.connect('mongodb://127.0.0.1:27017/Kiosk_Shopify_App')
        await mongoose.connect('mongodb+srv://zahid:zahid313@cluster0.7kqkz.mongodb.net/SimpleCheckout')

        console.log("Database connected successfully")
    } catch (error) {
        console.log("Database connection failed")
    }
}

export default DbConnection