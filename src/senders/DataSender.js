class DataSender{
    sender
    reads=[]
    constructor(sender){
        this.sender=sender
    }
    start(){
        this.sender.start()
    }

    stop(){
        this.sender.stop()
    }
    end(){
        this.reads=this.sender.end()
    }
}

module.exports=DataSender
