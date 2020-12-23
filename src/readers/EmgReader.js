class EmgReader{
    reader
    signal=[]
    constructor(reader){
        this.reader=reader
    }
    read(){
        this.reader.read()
        this.signal=this.reader.data
        .map((row,index)=>{
            return [String(index),row]
        })  
    }
}

module.exports=EmgReader