import mongoose from "mongoose";
const AnalyticsSchema = new mongoose.Schema({
    Store_Id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        
    },
    domain:{
        type:String,
        required:true
    },
    ScannerCount: {
        type: Number,
        default: 1
    },
    
   
},{
    timestamps:true
});

const AnalyticsModel = mongoose.model('Analytics', AnalyticsSchema);
export default AnalyticsModel;