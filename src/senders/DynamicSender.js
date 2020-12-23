const  AbstractSender  = require("./AbstractSender")

class DynamicSender extends AbstractSender{
    constructor(event,socket){
        super([],event,socket)
        this.startPort()
    }
    start(){
        this.startCondition()
    }
    stop(){
        this.stopCondition()
    }

}

module.exports=DynamicSender
