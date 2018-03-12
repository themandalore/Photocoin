pragma solidity ^0.4.18;

import "./PhotoCore.sol";

contract Auction {
    address public owner;

    mapping(address => uint) pendingReturns;
    mapping (uint256 => address ) highestBidder;
    mapping (uint256 => uint) highestBid;
    mapping (uint256 => bool ) ended;
    mapping (uint256 => uint) auctionEnd; 

    PhotoCore token; //The PhotoCore contract for linking to the Photocoin token

    event HighestBidIncreased(uint256 _token, address bidder, uint amount);
    event AuctionEnded(uint256 _token, address winner, uint amount);

    /***MODIFIERS***/
    /// @dev Access modifier for Owner functionality
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    /***FUNCTIONS***/
    function Auction () public {
        owner = msg.sender;
    }
    


    function setAuction(uint _biddingTime,uint256 _token) public {
        auctionEnd[_token] = now + _biddingTime;
    }

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


    function endAuction(uint _token) public {
        require(now >= auctionEnd[_token]);
        require(!ended[_token]);
        ended[_token] = true;
        AuctionEnded(_token,highestBidder[_token], highestBid[_token]);
        owner.transfer(highestBid[_token]);
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