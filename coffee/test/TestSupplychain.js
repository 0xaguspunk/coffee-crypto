// This script is designed to test the solidity smart contract - SuppyChain.sol -- and the various functions within
// Declare a variable and assign the compiled smart contract artifact
const truffleAssert = require('truffle-assertions')
const SupplyChain = artifacts.require('SupplyChain')

contract('SupplyChain', function(accounts) {
    // Declare few constants and assign a few sample accounts generated by ganache-cli
    let sku = 1
    let upc = 1
    const ownerID = accounts[0]
    const originFarmerID = accounts[1]
    const originFarmName = "John Doe"
    const originFarmInformation = "Yarray Valley"
    const originFarmLatitude = "-38.239770"
    const originFarmLongitude = "144.341490"
    let productID = 0
    const productNotes = "Best beans for Espresso"
    const productPrice = web3.utils.toWei("1", "ether")
    let itemState = 0
    const distributorID = accounts[2]
    const retailerID = accounts[3]
    const consumerID = accounts[4]
    const emptyAddress = '0x00000000000000000000000000000000000000'

    ///Available Accounts
    ///==================
    ///(0) 0x27d8d15cbc94527cadf5ec14b69519ae23288b95
    ///(1) 0x018c2dabef4904ecbd7118350a0c54dbeae3549a
    ///(2) 0xce5144391b4ab80668965f2cc4f2cc102380ef0a
    ///(3) 0x460c31107dd048e34971e57da2f99f659add4f02
    ///(4) 0xd37b7b8c62be2fdde8daa9816483aebdbd356088
    ///(5) 0x27f184bdc0e7a931b507ddd689d76dba10514bcb
    ///(6) 0xfe0df793060c49edca5ac9c104dd8e3375349978
    ///(7) 0xbd58a85c96cc6727859d853086fe8560bc137632
    ///(8) 0xe07b5ee5f738b2f87f88b99aac9c64ff1e0c7917
    ///(9) 0xbd3ff2e3aded055244d66544c9c059fa0851da44

    console.log("ganache-cli accounts used here...")
    console.log("Contract Owner: accounts[0] ", accounts[0])
    console.log("Farmer: accounts[1] ", accounts[1])
    console.log("Distributor: accounts[2] ", accounts[2])
    console.log("Retailer: accounts[3] ", accounts[3])
    console.log("Consumer: accounts[4] ", accounts[4])

    it("Testing adding roles to the contract", async () => {
        const supplyChain = await SupplyChain.deployed()

        let contractOwner = await supplyChain.owner();
        assert.equal(contractOwner, ownerID);

        let farmerAdded = await supplyChain.addFarmer(originFarmerID);
        truffleAssert.eventEmitted(farmerAdded, 'FarmerAdded');

        let distributorAdded = await supplyChain.addDistributor(distributorID);
        truffleAssert.eventEmitted(distributorAdded, 'DistributorAdded');

        let retailerAdded = await supplyChain.addRetailer(retailerID);
        truffleAssert.eventEmitted(retailerAdded, 'RetailerAdded');

        let consumerAdded = await supplyChain.addConsumer(consumerID);
        truffleAssert.eventEmitted(consumerAdded, 'ConsumerAdded');
    })

    // 1st Test
    it("Testing smart contract function harvestItem() that allows a farmer to harvest coffee", async() => {
        const supplyChain = await SupplyChain.deployed()

        // Mark an item as Harvested by calling function harvestItem()
        let event = await supplyChain.harvestItem(
          upc,
          originFarmerID,
          originFarmName,
          originFarmInformation,
          originFarmLatitude,
          originFarmLongitude,
          productNotes,
          { from: ownerID }
        )

        // Determine if the event has been emitted using `truffleAssert`
        truffleAssert.eventEmitted(event, 'Harvested')

        // Mark an item as Harvested by calling function harvestItem()
        await supplyChain.harvestItem(upc, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes, { from: originFarmerID })

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc)
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferOne[0], sku + 1, 'Error: Invalid item UPC')
        assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC')
        assert.equal(resultBufferOne[3], originFarmerID, 'Error: Invalid originFarmerID')
        assert.equal(resultBufferOne[4], originFarmName, 'Error: Invalid originFarmName')
        assert.equal(resultBufferOne[5], originFarmInformation, 'Error: Invalid originFarmInformation')
        assert.equal(resultBufferOne[6], originFarmLatitude, 'Error: Invalid originFarmLatitude')
        assert.equal(resultBufferOne[7], originFarmLongitude, 'Error: Invalid originFarmLongitude')
        assert.equal(resultBufferTwo[5], 0, 'Error: Invalid item State')
    })

    // 2nd Test
    it("Testing smart contract function processItem() that allows a farmer to process coffee", async() => {
        const supplyChain = await SupplyChain.deployed();

        // Mark an item as Processed by calling function processItem()
        const event = await supplyChain.processItem(upc, { from: originFarmerID })

        // Determine if the event has been emitted using `truffleAssert`
        truffleAssert.eventEmitted(event, 'Processed')

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferTwo[5], 1, 'Error: State should be Processed')
    })    

    // 3rd Test
    it("Testing smart contract function packItem() that allows a farmer to pack coffee", async() => {
        const supplyChain = await SupplyChain.deployed()

        // Mark an item as Packed by calling function packItem()
        const event = await supplyChain.packItem(upc, { from: originFarmerID });

        // Determine if the event has been emitted using `truffleAssert`
        truffleAssert.eventEmitted(event, 'Packed');

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferTwo[5], 2, 'Error: State should be Packed');
    })    

    // 4th Test
    it("Testing smart contract function sellItem() that allows a farmer to sell coffee", async() => {
        const supplyChain = await SupplyChain.deployed()

        // Mark an item as ForSale by calling function sellItem()
        const event = await supplyChain.sellItem(upc, productPrice, { from: originFarmerID })

        // Determine if the event has been emitted using `truffleAssert`
        truffleAssert.eventEmitted(event, 'ForSale')

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferTwo[4], productPrice, "Error: Invalid product price")
        assert.equal(resultBufferTwo[5], 3, 'Error: State should be ForSale')
    })    

    // 5th Test
    it("Testing smart contract function buyItem() that allows a distributor to buy coffee", async() => {
        const supplyChain = await SupplyChain.deployed()

        // Mark an item as Sold by calling function buyItem()
        const event = await supplyChain.buyItem(upc, { from: distributorID, value: productPrice })

        // Determine if the event has been emitted using `truffleAssert`
        truffleAssert.eventEmitted(event, 'Sold')

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferTwo[5], 4, 'Error: Invalid item State')
        assert.equal(resultBufferTwo[6], distributorID, 'Error: State should be Sold')
    })    

    // 6th Test
    it("Testing smart contract function shipItem() that allows a distributor to ship coffee", async() => {
        const supplyChain = await SupplyChain.deployed()

        // Mark an item as Shipped by calling function shipItem()
        const event = await supplyChain.shipItem(upc, { from: distributorID })

        // Determine if the event has been emitted using `truffleAssert`
        truffleAssert.eventEmitted(event, 'Shipped');

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferTwo[5], 5, 'Error: State should be Shipped');
    })    

    // 7th Test
    it("Testing smart contract function receiveItem() that allows a retailer to mark coffee received", async() => {
        const supplyChain = await SupplyChain.deployed()

        // Mark an item as Received by calling function receiveItem()
        const event = await supplyChain.receiveItem(upc, { from: retailerID })

        // Determine if the event has been emitted using `truffleAssert`
        truffleAssert.eventEmitted(event, 'Received')

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferTwo[5], 6, 'Error: State should be Received')
    })

    // 8th Test
    it("Testing smart contract function purchaseItem() that allows a consumer to purchase coffee", async() => {
        const supplyChain = await SupplyChain.deployed()

        // Mark an item as Purchased by calling function purchaseItem()
        const event = await supplyChain.purchaseItem(upc, { from: consumerID })

        // Determine if the event has been emitted using `truffleAssert`
        truffleAssert.eventEmitted(event, 'Purchased');

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferTwo[5], 7, 'Error: State should be Purchased')
    })

    // 9th Test
    it("Testing smart contract function fetchItemBufferOne() that allows anyone to fetch item details from blockchain", async() => {
        const supplyChain = await SupplyChain.deployed()

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc, { from: consumerID })

        // Verify the result set:
        assert.equal(resultBufferOne[0], 2, 'Error: Invalid item SKU')
        assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC')
        assert.equal(resultBufferOne[2], consumerID, 'Error: Invalid ownerID')
        assert.equal(resultBufferOne[3], originFarmerID, 'Error: Invalid originFarmerID')
        assert.equal(resultBufferOne[4], originFarmName, 'Error: Invalid originFarmName')
        assert.equal(resultBufferOne[5], originFarmInformation, 'Error: Invalid originFarmInformation')
        assert.equal(resultBufferOne[6], originFarmLatitude, 'Error: Invalid originFarmLatitude')
        assert.equal(resultBufferOne[7], originFarmLongitude, 'Error: Invalid originFarmLongitude')
    })

    // 10th Test
    it("Testing smart contract function fetchItemBufferTwo() that allows anyone to fetch item details from blockchain", async() => {
        const supplyChain = await SupplyChain.deployed()

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc, {from: accounts[7]})

        // Verify the result set:
        assert.equal(resultBufferTwo[0], 2, 'Error: Invalid item SKU')
        assert.equal(resultBufferTwo[1], upc, 'Error: Invalid item UPC')
        assert.equal(resultBufferTwo[2], productID, 'Error: Invalid productID')
        assert.equal(resultBufferTwo[3], productNotes, 'Error: Invalid product notes')
        assert.equal(resultBufferTwo[4], productPrice, 'Error: Invalid price')
        assert.equal(resultBufferTwo[5], 7, 'Error: Invalid state')
        assert.equal(resultBufferTwo[6], distributorID, 'Error: Invalid distributor id')
        assert.equal(resultBufferTwo[7], retailerID, 'Error: Invalid retailer id')
        assert.equal(resultBufferTwo[8], consumerID, 'Error: Invalid consumer id')
    })
});
