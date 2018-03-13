pragma solidity ^0.4.18;

import "./PhotoCore.sol";

contract Auction {
    /***VARIABLES***/
    address public owner; //owner of the contracts
    PhotoCore token; //The PhotoCore contract for linking to the Photocoin token

    /***STORAGE***/
    mapping(address => uint) pendingReturns;//maps addresses to the amount they can withdraw form the contract
    mapping (uint256 => address ) highestBidder;//maps a token to the highestBidder address for that token
    mapping (uint256 => uint) highestBid;//maps a token to the highestBid in wei for that token
    mapping (uint256 => bool ) ended;//maps a token to whether the auction for that token has ended
    mapping (uint256 => uint) auctionEnd; //maps a token to the end UNIX time for that auction

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
    *@dev Constructor function to set the owner
    */
    function Auction () public {
        owner = msg.sender;
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
        auctionEnd[_token] = now + _biddingTime;
        token.transferFrom(msg.sender,address(this),_token);
    }

    /**
    *@dev allows a party to place a bid for a certain token
    *@param _token the unique tokenId
    */
    function bid(uint256 _token) public payable {
        require(now <= auctionEnd[_token]);
        require(msg.value > highestBid[_token]);
        if (highestBid[_token] != 0) {
            pendingReturns[highestBidder[_token]] += highestBid[_token];
        }
        highestBidder[_token] = msg.sender;
        highestBid[_token] = msg.value;
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
        require(now >= auctionEnd[_token]);
        require(!ended[_token]);
        ended[_token] = true;
        AuctionEnded(_token,highestBidder[_token], highestBid[_token]);
        token.transferFrom(address(this),highestBidder[_token], _token);
        pendingReturns[owner] += highestBid[_token];
    }

    /**
    *@dev allows parties to query the current highest bid in a token auction
    *@param _token the unique tokenId
    */
    function getHighestBid(uint _token) public constant returns(uint){
        return highestBid[_token];
    }

    /**
    *@dev allows parties to query the current highest bidder in a token auction
    *@param _token the unique tokenId
    */
    function getHighestBidder(uint _token) public constant returns(address){
        return highestBidder[_token];
    }

    /**
    *@dev allows parties to query the end time of a token auction
    *@param _token the unique tokenId
    */
    function getAuctionEnd(uint _token) public constant returns(uint){
        return auctionEnd[_token];
    }

    /**
    *@dev allows parties to query if an auction has ended
    *@param _token the unique tokenId
    */
    function getEnded(uint _token) public constant returns(bool){
        return ended[_token];
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
}