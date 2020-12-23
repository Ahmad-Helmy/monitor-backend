"use strict";

const express = require("express");
const cors = require("cors");
const http = require("http");
const mongoose = require("mongoose");
const socketIO = require('socket.io');
const CsvReader  = require("./readers/CsvReader.js");
const EcgReader = require("./readers/EcgReader.js");
const EmgReader = require("./readers/EmgReader.js");
const DataSender=require("./senders/DataSender")
const StaticSender=require("./senders/StaticSender")
const DynamicSender=require("./senders/DynamicSender")
const PatientModel=require('./models/patient.model')
const fs=require('fs')
const port =require('./helpers/port')

const Patient=require('./routes/patient');
const { report } = require("./routes/patient");
const  START=0
const  LIMIT=100

const app = express();


app.set("port", process.env.PORT || 4200);


const  server = http.createServer(app).listen(app.get("port"), function () {
  console.log("Express server listening on port " + app.get("port"));
});
const io = socketIO(server);
app.use(cors());
app.use(express.json());


mongoose.connect("mongodb://localhost:27017/arduino_temp").then(()=>{
  console.log("mongoDB connected");
});

function getSamples(n,data){
  const samples=[]
  for (let i = 0; i < data.length; i+=n) {
    samples.push(data.slice(i,i+n))
  }

  return samples
}

function getSamplesAVGAndRange(data){
  if (!data[1]) {
    return [null,null]
  }
  let sum=0
  let max=+data[1][1]
  let min=+data[1][1]
  for (let i = 0; i < data.length; i++) {
    sum+=+data[i][1]
    if (+data[i][1]>max) max=+data[i][1]
    if (+data[i][1]<min) min=+data[i][1]
  }
  return [sum/data.length,max-min]
}

function getAVG(data) {
  let sum=0
  for (let i = 0; i < data.length; i++) {
    console.log(data[i][1]);
    sum+=+data[i][1]
  }
  return sum/data.length
}

port.on('open',()=>{console.log("port connected")})

io.on('connection',  (socket) => {

  console.log('new user connected')

  
  socket.on('initialize',async (data)=>{
    let ecgReader
    let emgReader
    let tempReader

    let tempSender
    let ecgSender
    let emgSender
    
    if (data.mode=='new') {
      ecgReader = new EcgReader(new CsvReader('src/assets/ECG.csv'))
      emgReader = new EmgReader(new CsvReader('src/assets/EMG.csv'))
      ecgReader.read()
      emgReader.read()
      ecgSender=new DataSender(new StaticSender(START,LIMIT,ecgReader.signal,'ecg',socket))
      emgSender=new DataSender(new StaticSender(START,LIMIT,emgReader.signal,'emg',socket))
      tempSender=new DataSender(new DynamicSender('temp',socket))
    }
    else if(data.mode=='show'){
      const patient = await PatientModel.findById(data.id) 
      const read=patient.reads.find(r=>r._id==data.readId)
      ecgReader=read.ecg
      emgReader=read.emg
      tempReader=read.temp
      ecgSender=new DataSender(new StaticSender(START,LIMIT,ecgReader,'ecg',socket))
      emgSender=new DataSender(new StaticSender(START,LIMIT,emgReader,'emg',socket))
      tempSender=new DataSender(new StaticSender(0,1,tempReader,'temp',socket))
    }
    
    
    socket.on('getData',()=>{
      ecgSender.start()
      emgSender.start()
      tempSender.start()
    })
    socket.on('stopData',()=>{
        ecgSender.stop()
        emgSender.stop()
        tempSender.stop()
    })
    socket.on('saveData',()=>{
        ecgSender.end()
        emgSender.end()
        tempSender.end() 

        const tempSamples=getSamples(3,tempSender.reads)

        const tempSamplesAVG=[]
        const tempSamplesRange=[]
        tempSamples.forEach((v,i)=>{
          const [avg,r]=getSamplesAVGAndRange(v)
          if (avg) {
            tempSamplesAVG.push([i+1,avg])
            tempSamplesRange.push([i+1,r])
          }
        })

        const tempAVGAVG=getAVG(tempSamplesAVG)
        const tempRangeAVG=getAVG(tempSamplesRange)

        const xUCL =tempAVGAVG + 1.02*tempRangeAVG
        const xCL =tempAVGAVG;
        const xLCL =tempAVGAVG - 1.02*tempRangeAVG

        const rUCL = 2.57*tempRangeAVG
        const rCL =tempRangeAVG;
        const rLCL = 0*tempRangeAVG

        const read={
          duration:tempSender.reads.length/5,
          ecg:ecgSender.reads,
          emg:emgSender.reads,
          temp:tempSender.reads,
          xChart:{
            UCL:xUCL,
            CL:xCL,
            LCL:xLCL,
            avg:tempSamplesAVG
          },
          rChart:{
            UCL:rUCL,
            CL:rCL,
            LCL:rLCL,
            range:tempSamplesRange
          },
        }
        
        const saved = await Patient.pushRead(data.id,read)
        if (saved) socket.emit("saved")
      })
  })

})
  





app.use('/patient',Patient)