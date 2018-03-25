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

There are three contracts that have inherit relationships leading to the PC Token Marketplace Contract

SafeMath -> PhotoCore -> PhotoMarket


  * Orderbook Structure

The orderbooks for photo sales and leases are simple arrays

    uint[] public forSale; //array of tokenId's for sale
    uint[] public forLease;//An array of tokens for lease

Additional mappings enable us to look at details

    struct Order {
        address maker;// the placer of the order
        uint price;// The price in wei
    }
     //Maps a tokenId to a specific Order (owner/price)
    mapping(uint256 => Order) public orders;
    //Index telling where a specific tokenId is in the forSale array
    mapping(uint256 => uint256) forSaleIndex;
     //Maps a tokenId to a specific Lease Order (owner/price)
    mapping(uint256 => Order) public leases;
    //Shows which tokens a party has bought rights for
    mapping(address => uint[]) leasesOwned;
    //Shows which parties have rights to a token
    mapping(uint256 => address[]) tokenLeases;
    //Index telling where a specific tokenId is in the forLease array
    mapping(uint256 => uint256) forLeaseIndex;
    //Index telling if a tokenId is listed
    mapping(uint256 => bool) forLeaseListed;
    
There is also an additional blacklist to punish orderbook abusers

    //A list of the blacklisted addresses
    mapping(address => bool) blacklist;


### Functions and Variables

#### Variables
```
   Public Variables
      owner 
```

#### Functions
   
    Public Functions
      PhotoMarket.sol
        PhotoMarket //Constructor
        listPhoto
        unlistPhoto
        buyPhoto
        listLease
        unlistLease
        buyLease
        getOrder
        getLeases
        getLeasebyOwner
        getTokenLeases
        setOwner
        blacklistParty
        isBlacklist
        getOrderCount
        getLeaseCount
        setFee
        withdraw
      
   
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

Leasing a photo uses the exact same workflow as buying/selling a token, only once leased, the token is not removed from the orderbook as multiple parties can own the rights to use a photograph

## The PC Token Auction contract

### Structure
  * General

There are three contracts that have inherit relationships leading to the PC Token Auction Contract

SafeMath -> PhotoCore -> Auction

  * Auction structure

The owner is the only one permitted to initiate an auction.  

A token is placed up for auction in the auctions array

    Details[] public auctions; //array of auction details

Additional mappings enable us to look at details

    struct Details {
        uint tokenId;
        address highestBidder;//Name of photograph
        uint highestBid;//Name of photographer
        bool ended;
        uint auctionEnd; //Hash of photo
     }
    mapping(uint => uint) public auctionIndex; //Gets position of a token in the auction array
    mapping(address => uint) public pendingReturns;//maps addresses to the amount they can withdraw form the contract

### Functions and Variables

#### Variables
```
   Public Variables
      owner 
```

#### Functions
   
    Public Functions
      Auction.sol
        Auction //Constructor
        setAuction
        bid
        withdraw
        endAuction
        getHighestBid
        getHighestBidder
        getAuctionEnd
        getEnded
        getNumberofAuctions
        setToken
        setOwner

      
   
#### Setup and Basic Functions

  * Deploy Contracts
```       
    truffle compile
    truffle develop
    migrate
```   
  * Auction a Photo (Only Owner can perform this function)
```
    auction.setAuction(86400 * 7,10); //note the first variable is in seconds, second is the token ID
    Note: The photo is transfered to the market contract upon listing
```
  * Place a bid for the Photo
```
    bid(10); //the variable is the tokenId and the value of the bid is the amount sent with call
```   
  * Withdraw money from contract
```
    Withdraw; //if your bid is no longer the highest, you can withdraw your ether
```
  * End the Auction
```
    endAuction(10); //The variable is the tokenId.  Once the time of the auction is over, this function transfers the token to the highest bidder and the owner can now withdraw the highest bid
```
  * The owner can now withdraw funds like any other contract participant

### App (localhost) Setup:


In one terminal:
```
ganache-cli -m document

//Note if you don't use the specific mnemonic, you will need to change the account[0] variable in the create_photos.js script.
Creator Private key - 5838675896e9edc7493ab081bdac45900fb2500b7837ab7ba1ea16cf476ac89c (please don't use on mainnet...for obvious reasons)
```


In a separate terminal:

```
cd C:/..../Photocoin
truffle compile
truffle migrate
```

In third terminal:
```
cd C:/..../Photocoin
npm run start
```

This should start the app at http://localhost:3000/
Change your metamask network to localhost:8545

In the folder scripts, go to the create_photos.js

```
For myaddress1 and myaddress2, put in your metamask addresses that you want to use to interact with the contracts (we will send them local Ether and Photocoins)

```

Now in the second terminal, run:

```
truffle exec scripts/create_photos.js
```

Now your myaddress1 has phots 0,1 and 2 and both of your accounts have 10 ether.  Test out the buttons that they call metamask!

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
