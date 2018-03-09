pragma solidity ^0.4.18;

 import "./library/SafeMath.sol";
 import "./PhotoCore.sol";

/**
*@title PhotoMarket
* The market contract which holds the orderbook for Photos to allow buying, selling, and liscenses
*/
contract PhotoMarket{
    using SafeMath for uint256;

    /***VARIABLES***/
    PhotoCore token; //The PhotoCore contract for linking to the Photocoin token
    address public owner; //The owner of the market contract
    
    /***DATA***/
    //This is the base data structure for an order (the maker of the order and the price)
    struct Order {
        address maker;// the placer of the order
        uint price;// The price in wei
    }

    //Maps a tokenId to a specific Order (owner/price)
    mapping(uint256 => Order) public orders;
    //An array of tokens for sale
    uint[] public forSale;
    //Index telling where a specific tokenId is in the forSale array
    mapping(uint256 => uint256) forSaleIndex;



    //Maps a tokenId to a specific Lease Order (owner/price)
    mapping(uint256 => Order[]) public leases;
    //Index telling where a specific tokenId is in the leases Order array
    mapping(uint256 => uint256) leasesIndex;
    //An array of tokens for lease
    uint[] public forLease;
    //Index telling where a specific tokenId is in the forLease array
    mapping(uint256 => uint256) forLeaseIndex;


    //A list of the blacklisted addresses
    mapping(address => bool) blacklist;

    /***MODIFIERS***/
    /// @dev Access modifier for Owner functionality
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }


    /***EVENTS***/
    event OrderPlaced(uint256 _tokenId, address _seller,uint256 _price);
    event Sale(address _buyer, address _seller, uint256 _tokenId, uint256 _price);
    event OrderRemoved(uint256 _tokenId);
    event LeaseOrderPlaced(uint256 _tokenId, address _seller,uint256 _price);
    event Lease(address _buyer, address _seller, uint256 _tokenId, uint256 _price);
    event LeaseOrderRemoved(uint256 _tokenId);

    /***FUNCTIONS***/
    /*
    *@dev the constructor argument to set the owner and initialize the array.
    */
    function PhotoMarket() public{
        owner = msg.sender;
        forSale.push(0);
        forLease.push(0);
    }

    /*
    *@dev The fallback function to prevent money from being sent to the contract
    */
    function()  payable public{
        require(msg.value == 0);
    }

    /*
    *@dev listPhoto allows a party to place a photo on the orderbook
    *@param _tokenId uint256 ID of photo
    *@param _price uint256 price of photo in wei
    */
    function listPhoto(uint256 _tokenId, uint256 _price) external {
        require(token.ownerOf(_tokenId) == msg.sender);
        require(blacklist[msg.sender] == false);
        require(_price > 0);
        token.transferFrom(msg.sender,address(this),_tokenId);
        forSaleIndex[_tokenId] = forSale.length;
        forSale.push(_tokenId);
        orders[_tokenId] = Order({
            maker: msg.sender,
            price: _price
        });
        OrderPlaced(_tokenId,msg.sender,_price);
    }

    /*
    *@dev unlistPhoto allows a party to remove their order from the orderbook
    *@param _tokenId uint256 ID of photo
    */
    function unlistPhoto(uint256 _tokenId) external{
        require(forSaleIndex[_tokenId] > 0);
        Order memory _order = orders[_tokenId];
        require(msg.sender== _order.maker || msg.sender == owner);
        unLister(_tokenId);
        token.transferFrom(address(this),msg.sender,_tokenId);
        OrderRemoved(_tokenId);
    }

    /*
    *@dev buyPhoto allows a party to send Ether to buy a photo off of the orderbook
    *@param _tokenId uint256 ID of photo
    */
    function buyPhoto(uint256 _tokenId) external payable {
        Order memory _order = orders[_tokenId];
        require(msg.value == _order.price);
        require(blacklist[msg.sender] == false);
        address maker = _order.maker;
        token.transferFrom(address(this),msg.sender, _tokenId);
        unLister(_tokenId);
        maker.transfer(msg.value);
        Sale(msg.sender,maker,_tokenId,_order.price);
    }

    /*
    *@dev getOrder lists the price and maker of a specific token
    *@param _tokenId uint256 ID of photo
    */
    function getOrder(uint256 _tokenId) external view returns(address,uint){
        Order storage _order = orders[_tokenId];
        return (_order.maker,_order.price);
    }

    /*
    *@dev allows the owner to change who the owner is
    *@param _owner is the address of the new owner
    */
    function setOwner(address _owner) public onlyOwner() {
        owner = _owner;
    }

    /*
    *@dev allows the owner to set the address of the PhotoCoin token
    *@param _token address of the PhotoCoin token (PhotoCore.sol)
    */
    function setToken(address _token) public onlyOwner() {
        token = PhotoCore(_token);
    }

    /*
    *@dev Allows the owner to blacklist addresses from using this exchange
    *@param _address the address of the party to blacklist
    *@param _motion true or false depending on if blacklisting or not
    */
    function blacklistParty(address _address, bool _motion) public onlyOwner() {
        blacklist[_address] = _motion;
    }

    /*
    *@dev Allows parties to see if one is blacklisted
    *@param _address the address of the party to blacklist
    */
    function isBlacklist(address _address) public view returns(bool) {
        return blacklist[_address];
    }

    /*
    *@dev getExcrow allows parties to see how much a specific party has in Escrow
    *@return _uint of the number of orders in the orderbook
    */
    function getOrderCount() public constant returns(uint) {
        return forSale.length;
    }

    /***INTERNAL FUNCTIONS***/
    /*
    *@dev An internal function to update mappings when an order is removed from the book
    *@param _tokenId uint256 ID of photo
    */
    function unLister(uint256 _tokenId) internal{
        uint256 tokenIndex = forSaleIndex[_tokenId];
        uint256 lastTokenIndex = forSale.length.sub(1);
        uint256 lastToken = forSale[lastTokenIndex];
        orders[_tokenId] = Order({
            maker: address(0),
            price: 0
        });
        forSale[tokenIndex] = lastToken;
        forSale.length--;
        forSaleIndex[_tokenId] = 0;
    }
}