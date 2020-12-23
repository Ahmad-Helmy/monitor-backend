const port = require("../helpers/port");
class AbstractSender{
    sending
    data
    event
    socket
    reads=[]
    last
    constructor(data,event,socket){
        this.data=data
        this.event=event
        this.socket=socket
    }
    startCondition(){
      this.sending=true
    }
    stopCondition(){
      this.sending=false;
  }
    startInterval(data,callBack){
        let interval=setInterval(()=>{
          let subData=callBack(data)
          this.send(subData)
          if (!this.sending) {
            clearInterval(interval)
          }
        },1000)
    }
    startPort(){
      let firstInput=true   
      port.on("data", (data)=>{
        if (this.sending) {
          const subData=data.toString('utf8')
          const fCond=Math.abs(+this.last-(+subData))<2
          if ( fCond || firstInput) {
            this.send([['0',subData?subData:'10']])
            this.last=subData
            console.log(subData);
            firstInput=false
          }else{
            this.send([['0',this.last?this.last:'10']])
          }
        }
      });   
    }
    send(data){
      this.socket.emit(this.event,{data})
      this.reads=this.reads.concat(data)
    }

    end(){
      this.stopCondition()
      return this.reads
    }
    start(){}
    stop(){}

   
}

module.exports=AbstractSender