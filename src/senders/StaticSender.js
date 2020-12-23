const  AbstractSender  =require( "./AbstractSender")

class StaticSender extends AbstractSender{
    startIndex
    limit
     constructor(start,limit,data,event,socket){
         super(data,event,socket)
         this.startIndex=start;
         this.limit=limit;
     }
     start(){
         this.startCondition()
         this.startInterval(this.data,(data)=>{
             let subData=data.slice(this.startIndex,this.startIndex+this.limit)
             this.startIndex+=this.limit
             return subData
         })
     }
 
     stop(){
         this.stopCondition()
     }
}

module.exports=StaticSender
