var multilevel = require('multilevel')
var net = require('net')

const { dbblocks, dbaddress } = require('./leveldb_config')

module.exports = (options) => {
    options.port = Number(options.port) || 3000
    options.host = options.host || '0.0.0.0'
    if(options.db === "blocks") {
        console.log("using blocks-db")
        options.db = dbblocks
    }
    if(options.db === "address"){
        options.db = dbaddress
        console.log("using address-db")
    }

    return {
        start: () => {
            if (options.log) {
                process.stdout.write('server starting: ' + JSON.stringify(options.host) + '\n')
              }
            return net.createServer(function (con) {
            con.pipe(multilevel.server(options.db)).pipe(con)
            }).listen(options.port, options.host)
        },
        close: (cb) => {
            db.close((err, val) => {
                if (server) {
                  server.close(cb)
                } else {
                  cb(err, val)
                }
         })
        }
    }
}