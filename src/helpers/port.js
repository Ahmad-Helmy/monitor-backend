const serialport = require("serialport");
let SerialPort = serialport.SerialPort;

const Readline = serialport.parsers.Readline;

let port = new serialport("COM7", {
  baudRate: 115200,
  parser: new Readline("\n"),
});

module.exports = port;
