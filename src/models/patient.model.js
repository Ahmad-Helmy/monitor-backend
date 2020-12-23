const mongoose = require('mongoose')

const patientSchema= new mongoose.Schema({
    name:String,

    age:Number,
    
    reads:[{
        time:{type:Date,default:new Date()},
        duration:Number,
        ecg:[[Number]],
        emg:[[Number]],
        temp:[[Number]],
        xChart:{
            UCL:Number,
            CL:Number,
            LCL:Number,
            avg:[]
        },
        rChart:{
            UCL:Number,
            CL:Number,
            LCL:Number,
            range:[]
        },
    }]
})

const Patient = mongoose.model("Patient",patientSchema)

module.exports=Patient