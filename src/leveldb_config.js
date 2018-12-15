var level = require('level')
const Path = require('path')

// encoding for all databases
const { blockStructure, addressStructure, utxStructure } = require('./encoding')

// destination of the databases
const datadirblocks = Path.join(__dirname, '../data', 'blocks')
const datadirtx = Path.join(__dirname, '../data', 'tx')
const datadiraddress = Path.join(__dirname, '../data', 'address')

// create new instance of every database (path, encoding)

const dbblocks = level(datadirblocks, blockStructure)
const dbutx = level(datadirtx, utxStructure)
const dbaddress = level(datadiraddress, addressStructure)

module.exports = {
  dbblocks,
  dbutx,
  dbaddress
}
