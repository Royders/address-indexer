# address-indexer for ltc

Data within the block chain is sorted by blocks. Within these blocks, n transactions with n inputs and outputs can be carried out. 
To obtain an overview of the current balance status of an address, it is necessary to "turn the data structure upside down", otherwise indexing by address is not possible. Due to the large number of transactions (and thus the inputs and outputs) and the length of the key, the fast Key Value Storage Enginge "leveldb" is used. This makes it possible to query individual addresses within less than 50ms (for a number of events < 50,000). This query speed enables the development of real time applications. 



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
