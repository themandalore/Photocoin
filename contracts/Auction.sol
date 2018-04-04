pragma solidity ^0.4.18;

import "./PhotoCore.sol";
 import "./library/SafeMath.sol";
 import "./library/ERC721Receiver.sol";
import "./library/AddressUtils.sol";

contract Auction {
    using SafeMath for uint256;
    /***VARIABLES***/
    address public owner; //owner of the contracts
    PhotoCore token; //The PhotoCore contract for linking to the Photocoin token
    // Equals to `bytes4(keccak256("onERC721Received(address,uint256,bytes)"))`
    // which can be also obtained as `ERC721Receiver(0).onERC721Received.selector`
    bytes4 constant ERC721_RECEIVED = 0xf0b9e5ba;

    /// @dev The main Photo struct
    struct Details {
        uint tokenId;
        address highestBidder;//Name of photograph
        uint highestBid;//Name of photographer
        bool ended;
        uint auctionEnd; //Hash of photo
     }

    /***STORAGE***/
    Details[] public auctions;//an array of all auctions
    mapping(uint => uint) public auctionIndex; //Gets position of a token in the auction array
    mapping(address => uint) public pendingReturns;//maps addresses to the amount they can withdraw form the contract

    /***EVENTS***/
    //event that indicates that the highest bid for a token has increased
    event HighestBidIncreased(uint256 _token, address bidder, uint amount);
    //event that indicates that an auction for a token has ended
    event AuctionEnded(uint256 _token, address winner, uint amount);

    /***MODIFIERS***/
    /// @dev Access modifier for Owner functionality
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    /***FUNCTIONS***/
    /**
    *@dev Constructor function to set the owner and initialize the array
    */
    function Auction () public {
        owner = msg.sender;
        auctions.push(Details({
            tokenId:0,
            highestBidder: owner,
            highestBid: 0,
            ended: false,
            auctionEnd: 0
        }));
    }
    
    /*
    *@dev The fallback function to prevent money from being sent to the contract
    */
    function()  payable public{
        require(msg.value == 0);
    }

    /**
    *@dev allows the owner to create an auction for a token
    *@param _biddingTime is a uint that represeents how long the auction lasts (UNIX time, 86400 is one day)
    *@param _token the unique tokenId
    */
    function setAuction(uint _biddingTime,uint256 _token) public onlyOwner() {
        auctionIndex[_token] = auctions.length;
        auctions.push(Details({
            tokenId: _token,
            highestBidder: owner,
            highestBid: 0,
            ended: false,
            auctionEnd: now + _biddingTime
            }));
        token.transferFrom(msg.sender,address(this),_token);
    }

    /**
    *@dev allows a party to place a bid for a certain token
    *@param _token the unique tokenId
    */
    function bid(uint256 _token) public payable {

        Details memory _auction = auctions[auctionIndex[_token]];
        require(now <= _auction.auctionEnd);
        require(msg.value > _auction.highestBid);
        if (_auction.highestBid != 0) {
            pendingReturns[_auction.highestBidder] += _auction.highestBid;
        }
        auctions[auctionIndex[_token]] = Details({
            tokenId: _token,
            highestBidder: msg.sender,
            highestBid: msg.value,
            ended: false,
            auctionEnd: _auction.auctionEnd
            });
        HighestBidIncreased(_token,msg.sender, msg.value);
    }

    /**
    *@dev allows any party to withdraw the funds owed to them in the contract
    */
    function withdraw() public returns (bool) {
        uint amount = pendingReturns[msg.sender];
        if (amount > 0) {
            pendingReturns[msg.sender] = 0;
            if (!msg.sender.send(amount)) {
                pendingReturns[msg.sender] = amount;
                return false;
            }
        }
        return true;
    }

    /**
    *@dev allows anyone to end the auction once the end date is reached
    *@param _token the unique tokenId
    */
    function endAuction(uint _token) public {
        Details memory _auction = auctions[auctionIndex[_token]];
        require(now > _auction.auctionEnd);
        require(_auction.ended == false);
        auctions[auctionIndex[_token]] = Details({
            tokenId: _token,
            highestBidder: _auction.highestBidder,
            highestBid: _auction.highestBid,
            ended: true,
            auctionEnd: _auction.auctionEnd
        });
        unLister(_token);
        AuctionEnded(_token,_auction.highestBidder,_auction.highestBid);
        token.transferFrom(address(this),_auction.highestBidder, _token);
        pendingReturns[owner] += _auction.highestBid;
    }

    /**
    *@dev allows parties to query the current highest bid in a token auction
    *@param _token the unique tokenId
    */
    function getHighestBid(uint _token) public constant returns(uint){
        Details memory _auction = auctions[auctionIndex[_token]];
        return _auction.highestBid;
    }

    /**
    *@dev allows parties to query the current highest bidder in a token auction
    *@param _token the unique tokenId
    */
    function getHighestBidder(uint _token) public constant returns(address){
        Details memory _auction = auctions[auctionIndex[_token]];
        return _auction.highestBidder;
    }

    /**
    *@dev allows parties to query the end time of a token auction
    *@param _token the unique tokenId
    */
    function getAuctionEnd(uint _token) public constant returns(uint){
        Details memory _auction = auctions[auctionIndex[_token]];
        return _auction.auctionEnd;
    }
    /**
    *@dev allows parties to query how many auctions are ongoing
    *@param _token the unique tokenId
    */
    function getNumberofAuctions() public constant returns(uint){
        return auctions.length;
    }
    /*
    *@dev allows the owner to set the address of the PhotoCoin token
    *@param _token address of the PhotoCoin token (PhotoCore.sol)
    */
    function setToken(address _token) public onlyOwner() {
        token = PhotoCore(_token);
    }
    /*
    *@dev allows the owner to change who the owner is
    *@param _owner is the address of the new owner
    */
    function setOwner(address _owner) public onlyOwner() {
        owner = _owner;
    }

    function unLister(uint256 _tokenId) internal{
        uint256 tokenIndex = auctionIndex[_tokenId];
        uint256 lastTokenIndex = auctions.length.sub(1);
        Details memory lastToken = auctions[auctionIndex[lastTokenIndex]];
        auctions[tokenIndex] = lastToken;
        auctions.length--;
        auctionIndex[lastToken.tokenId] = tokenIndex;
        auctionIndex[_tokenId] = 0;
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
}