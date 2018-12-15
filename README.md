# address-indexer for ltc

Prerequisite for starting the process:

```
- A LTC Node to connect to,
- At least 25 GB free HardDisk Space for the Sync Process,
- At least 80 GB free HardDisk Space for the LTC Nodes Data
```

Datamodel Address:
```
Key: <Address, Height, txid, timestamp, index, type> 
Value: <Amount> (if unspent)
Value: <Amount, txid, index, height, time> (if spent)
```
Datamodel Block:
```
Key: <height> 
Value: <time, hash> 
```


To start the process simply run 

```
npm start
```

This command will start the syncing process as well as the level-db server. To connect an API to the server, use the following ports:


```
5001 :  Address DB
5002:   Block DB
```

Based on your Hardware, the initial Sync will take roughly 2 1/2 -  4 hours. Because of the leveldb server, you can use the leveldb instance during that time to explore the data. 
