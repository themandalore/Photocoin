# Photocoin Smart Contract Guide

![Photocoin](./public/camera.jpeg)



# Contracts

There are three contracts deployed:
1. The token contract (PhotoCore.sol)
2. The marketplace contract (PhotoMarket.sol)
3. The auction contract (Auction.sol)


## The PC Token

### Structure

#### General

There are four contracts that have inherit relationships leading to the PC Token

SafeMath -> ERC721 -> PhotoBase -> PhotoCore



#### Photocoin Structure

Each tokenized photograph has 5 params to specify itself.

    struct Photo {
        string name;//Name of photograph
        string photographer;//Name of photographer
        bytes32 photoHash; //Hash of photo
        uint256 isenNumber;// The unique ISEN number
        uint64 uploadTime;// The timestamp from the block when this came into existence
    }


### Functions and Variable

  * Variables
```
   Public Variables
      name
      symbol
      owner 
      marketContract
      auctionContract
      totalTokens
```

   * Functions
   
    Public Functions
      PhotoCore.sol
        createPhoto
      PhotoBase.sol
        getPhoto
        transferFrom
        setAuction
        setMarket
        setWhitelist
        isWhitelist
        setOwner
      ERC721.sol
        transferFrom
        transferFrom(w/bytes as message)
        totalSupply
        setApprovalForAll
        balanceOf
        ownerOf
        isApproved
        isApproved(w/tokenId)
        approve
        approvedFor

#### Setup and Basic Functions

  * Deploy Contracts
```       
    truffle compile
    truffle develop
    migrate
```    
  * Upload Photo
```
    uploadPhoto(web3.sha3("PrettyFlowers.jpeg"),"Pretty Flowers","David",1862856);
```
  * Get Photo Info using its ID
```    
    getPhoto(1);
```
  * Get the number of Photos owned by a specific address.
```
    balanceOf("0x0d7EFfEFdB084DfEB1621348c8C70cc4e871Eba4");
```
  * Get the total number of Photographs uploaded.
```
    totalSupply();
```
  * Transfers the ownership of a photo token from one address to another address
```
    transferFrom("0x0d7EFfEFdB084DfEB1621348c8C70cc4e871Eba4", "0x0d7EFfEFdB084DfEB1621348c8C70cc4e871Eba5",1); 
    //Assuming you own the token and are either the first (_from) address or approved to do so.
```
  * Get TokenID of photo tokens owned by owner
```    
    tokensOf("0x0d7EFfEFdB084DfEB1621348c8C70cc4e871Eba4");
```
  * Get detail info of photo tokens from tokenID
```    
    getPhoto(1);
```

## The PC Token MarketPlace

### Structure
  * General

There are three that have inherit relationships leading to the PC Token Marketplace Contract

SafeMath -> PhotoCore -> PhotoMarket


  * Orderbook Structure

The orderbook for photos is a simple array

    uint[] public forSale; //array of tokenId's for sale

Additional mappings enable us to look at details

    struct Order {
        address maker;// the placer of the order
        uint price;// The price in wei
    }
    mapping(uint256 => Order) public orders;
    //Index telling where a specific tokenId is in the forSale array
    mapping(uint256 => uint256) forSaleIndex;


### Functions and Variables

#### Variables
```
   Public Variables
      owner 
```

#### Functions
   
    Public Functions
      PhotoMarket.sol
        listPhoto
        unlistPhoto
        buyPhoto
        getOrder
        withdrawFunds
      
   
#### Setup and Basic Functions

  * Deploy Contracts
```       
    truffle compile
    truffle develop
    migrate
```   
  * List a Photo on the orderbook
```
    listPhoto(1,5000000000000000000); //note price is in wei
    Note: The photo is transfered to the market contract upon listing
```
  * Query the orderbook for the details
```
    getOrder(1); //returns the order maker and the price
```   
  * Buy a Photo
```
    buyPhoto(1); //you must send with it the correct value
```
  * Withdraw your Funds
```
    withdraw(); //e.g. Assuming you sold a photo for 5 ether, you can now withdraw your 5 ether from the contract.
```
  * Unlist a Photo
```
    unlistPhoto(1); //You must be the one who placed the order or owner. 
```



#### Notes:

All contracts are owned by David Tera


## Testing
```
truffle compile
truffle develop
test
```

Further testing runs (with no contract changes) only require `truffle test`.

Should you make any changes to the contract files, make sure you `rm -rf build` before running `truffle compile && truffle test`.
