const { streamForever } = require('./scripts/sync')
const portBlocks = process.env.NODE_PORT || 5001
const portAddress = process.env.NODE_PORT || 5002




const serverblocks = require ('./src/server')({port: portBlocks, log: true, db : "blocks"})
const serveraddress = require ('./src/server')({port: portAddress, log: true, db : "address"})


streamForever()
serverblocks.start()
serveraddress.start()


