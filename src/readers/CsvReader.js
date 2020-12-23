const fs = require('fs')

class CsvReader {
  fileName;
  data = []
  constructor(fileName) {
    this.fileName = fileName;
  }

  read() {
    this.data = fs
      .readFileSync(this.fileName, { encoding: "utf-8" })
      .split("\n")
      
  }
}

module.exports=CsvReader