const express=require('express')
const router =express.Router()
const Patient=require('../models/patient.model')


router.get('/',async(req,res)=>{
    try {
        const patients= await Patient.find({})
        res.status(200).json({patients})
    } catch (error) {
        res.status(400).json(error)
    }
})


router.get('/:id',async(req,res)=>{

    const {id}=req.params

    try {
        const patient= await Patient.findById(id)
        res.status(200).json({patient})
    } catch (error) {
        res.status(400).json(error)
    }
})


router.post('/',async(req,res)=>{
    const {name,age}=req.body
    try {
        const patient= new Patient({
            name,
            age
        })
        await patient.save()
        res.status(200).json({patient})
    } catch (error) {
        res.status(400).json(error)
    }
})

export async function pushRead(patientId,read) {

    try {
        await Patient.findByIdAndUpdate(patientId,{
            $push:{
              reads:read
            }
          })
          return true
        
    } catch (error) {
        return false
    }
}



module.exports=router