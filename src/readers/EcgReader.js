class EcgReader{
    reader
    signal=[]
    constructor(reader){
        this.reader=reader
    }
    read(){
        this.reader.read()
        this.signal=this.reader.data.map((row) => {
            return row.split(";");
          })
    }
}

module.exports=EcgReader