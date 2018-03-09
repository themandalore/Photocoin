# CryptoPets Smart Contract Guide

![CryptoPets](./images/Logo.png)



# Contracts

There are two contracts deployed:
1. The token contract (PetCore.sol)
2. The marketplace contract (PetMarket.sol)


## The CP Token

### Structure

#### General

There are four contracts that have inherit relationships leading to the CP Token

SafeMath -> ERC721 -> PetBase -> PetCore



#### Pet Structure

Each pet has 3 params to specify itself.

    Pet {
    kind, // the type of pets
    genes, // the unique genetic ID to specify visibility of pet
    birthTime // the time creating pet
    }

    e.g. 
    kind - string variable("turtle")
    genes - string variable ("??????") A proprietary algorithm creates this string
    birthtime - Unix timestamp (1519928045) of when the pet is born

### Functions and Variable

  * Variables
```
   Public Variables
      name
      symbol
      owner 
      marketContract
      totalTokens
```

   * Functions
   
    Public Functions
      PetCore.sol
        createPet
      PetBase.sol
        getPet
        transferFrom
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
  * Create Pet
```
    createPet("Aardvark","28008","0x0d7EFfEFdB084DfEB1621348c8C70cc4e871Eba4");
```
  * Get Pet Info using its ID
```    
    getPet(1);
```
  * Get the number of Pets owned by a specific address.
```
    balanceOf("0x0d7EFfEFdB084DfEB1621348c8C70cc4e871Eba4");
```
  * Get the total number of Pets currently in existence.
```
    totalSupply();
```
  * Transfers a Pet to another address
```
    transferFrom("0x0d7EFfEFdB084DfEB1621348c8C70cc4e871Eba4", "0x0d7EFfEFdB084DfEB1621348c8C70cc4e871Eba5",1); 
    //Assuming you own the token and are either the first (_from) address or approved to do so.
```
  * Get TokenID of pets owned by owner
```    
    tokensOf("0x0d7EFfEFdB084DfEB1621348c8C70cc4e871Eba4");
```
  * Get detail info of pets from tokenID
```    
    getPet(1);
```

## The CP Token MarketPlace

### Structure
  * General

There are three that have inherit relationships leading to the CP Token Marketplace Contract

SafeMath -> PetCore -> PetMarket


  * Orderbook Structure

The orderbook for pets is a simple array

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
      PetMarket.sol
        listPet
        unlistPet
        buyPet
        getOrder
        withdrawFunds
      
   
#### Setup and Basic Functions

  * Deploy Contracts
```       
    truffle compile
    truffle develop
    migrate
```   
  * List a Pet on the orderbook
```
    listPet(1,5000000000000000000); //note price is in wei
    Note: The pet is transfered to the market contract upon listing
```
  * Query the orderbook for the details
```
    getOrder(1); //returns the order maker and the price
```   
  * Buy a Pet
```
    buyPet(1); //you must send with it the correct value
```
  * Withdraw your Funds
```
    withdraw(); //e.g. Assuming you sold a pet for 5 ether, you can now withdraw your 5 ether from the contract.
```
  * Unlist a Pet
```
    unlistPet(1); //You must be the one who placed the order or owner. 
```



#### Notes:

All contracts are owned by Alluminate.


## Testing
```
truffle compile
truffle develop
test
```

Further testing runs (with no contract changes) only require `truffle test`.

Should you make any changes to the contract files, make sure you `rm -rf build` before running `truffle compile && truffle test`.
