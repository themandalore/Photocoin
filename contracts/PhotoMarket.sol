pragma solidity ^0.4.18;

 import "./library/SafeMath.sol";
 import "./PhotoCore.sol";
 import "./library/ERC721Receiver.sol";
import "./library/AddressUtils.sol";

/**
*@title PhotoMarket
* The market contract which holds the orderbook for Photos to allow buying, selling, and liscenses
*/
contract PhotoMarket{
    using SafeMath for uint256;

    /***VARIABLES***/
    PhotoCore token; //The PhotoCore contract for linking to the Photocoin token
    address public owner; //The owner of the market contract
    uint public fee; //The percentage fee charged to each contract to 3 decimals (so 1000 is a 100% fee, 50 is a 5% fee, and 10 is a 1% fee)
    
    
    /***DATA***/
    //This is the base data structure for an order (the maker of the order and the price)
    struct Order {
        address maker;// the placer of the order
        uint price;// The price in wei
    }
    // Equals to `bytes4(keccak256("onERC721Received(address,uint256,bytes)"))`
  // which can be also obtained as `ERC721Receiver(0).onERC721Received.selector`
  bytes4 constant ERC721_RECEIVED = 0xf0b9e5ba;
    //Maps a tokenId to a specific Order (owner/price)
    mapping(uint256 => Order) public orders;
    //An array of tokens for sale
    uint[] public forSale;
    //Index telling where a specific tokenId is in the forSale array
    mapping(uint256 => uint256) forSaleIndex;
    //Maps a tokenId to a specific Lease Order (owner/price)
    mapping(uint256 => Order) public leases;
    //Shows which tokens a party has bought rights for
    mapping(address => uint[]) leasesOwned;
    //Shows which parties have rights to a token
    mapping(uint256 => address[]) tokenLeases;
    //An array of tokens for lease
    uint[] public forLease;
    //Index telling where a specific tokenId is in the forLease array
    mapping(uint256 => uint256) forLeaseIndex;
    //Index telling if a tokenId is listed
    mapping(uint256 => bool) forLeaseListed;
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
        require(forLeaseListed[_tokenId] == false);
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
        maker.transfer(_order.price.mul(1000-fee).div(1000));
        Sale(msg.sender,maker,_tokenId,_order.price);
    }


    /*
    *@dev listLease allows a party to place a photo on the orderbook for lease
    *@param _tokenId uint256 ID of photo
    *@param _price uint256 price of leasing the photo in wei
    */
    function listLease(uint256 _tokenId, uint256 _price) external {
        require(token.ownerOf(_tokenId) == msg.sender);
        require(forLeaseListed[_tokenId] == false);
        require(blacklist[msg.sender] == false);
        require(_price > 0);
        forLeaseIndex[_tokenId] = forLease.length;
        forLease.push(_tokenId);
        leases[_tokenId] = Order({
            maker: msg.sender,
            price: _price
        });
        LeaseOrderPlaced(_tokenId,msg.sender,_price);
        forLeaseListed[_tokenId] = true;
    }

    /*
    *@dev unlistLease allows a party to remove their order from the lease orderbook
    *@param _tokenId uint256 ID of photo
    */
    function unlistLease(uint256 _tokenId) external{
        require(forLeaseIndex[_tokenId] > 0);
        require(token.ownerOf(_tokenId) == msg.sender || msg.sender == owner);
        unLeaster(_tokenId);
        LeaseOrderRemoved(_tokenId);
        forLeaseListed[_tokenId] = false;
    }

    /*
    *@dev buyLease allows a party to send Ether to buy a photo off of the lease orderbook
    *@param _tokenId uint256 ID of photo
    *@Note currently this does not unlist the product; as multiple parties can pay the fee to use the rights
    *@Note there is only one kind of lease and a party can buy as many as they want
    */
    function buyLease(uint256 _tokenId) external payable {
        Order memory _order = leases[_tokenId];
        require(msg.value == _order.price);
        require(blacklist[msg.sender] == false);
        address maker = _order.maker;
        leasesOwned[msg.sender].push(_tokenId);
        tokenLeases[_tokenId].push(msg.sender);
        maker.transfer(_order.price.mul(1000-fee).div(1000));
        Sale(msg.sender,maker,_tokenId,_order.price);
    }

    /*
    *@dev getOrder lists the price and maker of a specific token for a sale
    *@param _tokenId uint256 ID of photo
    *@return address of the party selling the rights to the photo
    *@return uint of the price of the sale
    */
    function getOrder(uint256 _tokenId) external view returns(address,uint){
        Order storage _order = orders[_tokenId];
        return (_order.maker,_order.price);
    }

    /*
    *@dev getLeases lists the price and maker of a specific token for a Lease
    *@param _tokenId uint256 ID of photo
    *@return address of the party leasing the rights to the photo
    *@return uint of the price of the lease
    */
    function getLeases(uint256 _tokenId) external view returns(address,uint){
        Order storage _order = leases[_tokenId];
        return (_order.maker,_order.price);
    }
    /*
    *@dev getLeasesbyOwner lists all tokens leased by an address
    *@param _party is the address of the party  you are querying 
    *@return uint[] of tokenIds leased by party
    *@Note - does not include tokens the party owns. 
    */
    function getLeasebyOwner(address _party) external view returns(uint[]){
        return leasesOwned[_party];
    }

    /*
    *@dev getTokenLeases gives you all addresses that have leased a token
    *@param _tokenId uint256 ID of photo
    *@return address[] of all addresses that have leased a specific token
    */
    function getTokenLeases(uint256 _tokenId) external view returns(address[]){
        return tokenLeases[_tokenId];
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
    *@Note - This allows the owner to stop a malicious party from spamming the orderbook
    */
    function blacklistParty(address _address, bool _motion) public onlyOwner() {
        blacklist[_address] = _motion;
    }

    /*
    *@dev Allows parties to see if one is blacklisted
    *@param _address the address of the party to blacklist
    *@return bool, true for is blacklisted
    */
    function isBlacklist(address _address) public view returns(bool) {
        return blacklist[_address];
    }

    /*
    *@dev getOrderCount allows parties to query how many orders are on the book
    *@return _uint of the number of orders in the orderbook
    */
    function getOrderCount() public constant returns(uint) {
        return forSale.length;
    }

    /*
    *@dev getLeaseCount allows parties to query how many leases are on the book
    *@return _uint of the number of orders in the lease orderbook
    */
    function getLeaseCount() public constant returns(uint) {
        return forLease.length;
    }

    /*
    *@dev allows the owner to set the address of the fee for the marketplace contract
    *@param _fee percentage fee charged to each contract to 3 decimals (so 1000 is a 100% fee, 50 is a 5% fee, and 10 is a 1% fee)
    */
    function setFee(uint _fee) public onlyOwner() {
        fee = _fee;
    }

    /*
    *@dev allows owner to withdraw funds
    */
    function withdraw() public onlyOwner(){
        owner.transfer(this.balance);
    }
            /**
       * @notice Handle the receipt of an NFT
       * @dev The ERC721 smart contract calls this function on the recipient
       *  after a `safetransfer`. This function MAY throw to revert and reject the
       *  transfer. This function MUST use 50,000 gas or less. Return of other
       *  than the magic value MUST result in the transaction being reverted.
       *  Note: the contract address is always the message sender.
       * _from The sending address
       * _tokenId The NFT identifier which is being transfered
       * _data Additional data with no specified format
       * @return `bytes4(keccak256("onERC721Received(address,uint256,bytes)"))`
       */
      function onERC721Received(address, uint256, bytes) external view returns(bytes4) {
        return ERC721_RECEIVED;
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
        forSaleIndex[lastToken] = tokenIndex;
        forSale.length--;
        forSaleIndex[_tokenId] = 0;
    }

        /*
    *@dev An internal function to update mappings when a lease is removed from the book
    *@param _tokenId uint256 ID of photo
    */
    function unLeaster(uint256 _tokenId) internal{
        uint256 tokenIndex = forLeaseIndex[_tokenId];
        uint256 lastTokenIndex = forLease.length.sub(1);
        uint256 lastToken = forLease[lastTokenIndex];
        leases[_tokenId] = Order({
            maker: address(0),
            price: 0
        });
        forLease[tokenIndex] = lastToken;
        forLeaseIndex[lastToken] = tokenIndex;
        forLease.length--;
        forLeaseIndex[_tokenId] = 0;
    }
}