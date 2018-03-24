pragma solidity ^0.4.18;

import "./ERC721.sol";

/**
*@title PhotoBase
* Base contract for Photocoin. Holds all common structs, events and base variables.
*/
contract PhotoBase is ERC721{
    /***VARIABLES***/
    address public owner; //The owner of the contract
    address public marketContract; //The addresss of the official marketplace contract
    address public auctionContract; //The addresss of the official auction contract
    bool public allowUploads;

    /*** DATA TYPES ***/
    /// @dev The main Photo struct
    struct Photo {
        string name;//Name of photograph
        string photographer;//Name of photographer
        bytes32 photoHash; //Hash of photo
        uint256 isenNumber;// The unique ISEN number
        uint64 uploadTime;// The timestamp from the block when this came into existence
    }
    /*** STORAGE ***/
    mapping(uint256 => Photo) photos;//A mapping from photoId to the details of the photo
    mapping(address => bool) whitelist;// A list of addresses approved to trade
    bool public whitelistOn;

    /***MODIFIERS***/
    /// @dev Access modifier for Owner functionality
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    /*** EVENTS ***/
    /// @dev The Upload event is fired whenever a new photo is uploaded
    event Upload(address indexed _owner, uint256 _photoId,bytes32 _photoHash, string _name, string _photographer, uint _isenNumber);


    /***FUNCTIONS***/
    /**
    *@dev allows the owner to set the owner of the contract
    *@param _owner is the address of the new owner
    */
    function setOwner(address _owner) public onlyOwner() {
        owner = _owner;
    }

    /**
    *@dev allows the owner to set the official marketplace of the token
    *@param _market is the address of the PhotoMarket contract
    */
    function setMarket(address _market) public onlyOwner() {
        marketContract = _market;
    }
    /**
    *@dev allows the owner to set the official auction of the token
    *@param _market is the address of the PhotoMarket contract
    */
    function setAuction(address _auction) public onlyOwner() {
        auctionContract = _auction;
    }

    /**
    *@dev allows the owner to manage the whitelist
    *@param _user is the user to allow to trade
    */
    function setWhitelist(address _user, bool _trueorfalse) public onlyOwner() {
        whitelist[_user] = _trueorfalse;
    }


    /**
    *@dev allows users to query whether an address is whitelisted
    *@param _user is the user to allow to trade
    *@return bool is whether a user is allowed to trade
    */
    function isWhitelist(address _user) public view returns(bool){
        return whitelist[_user];
    }

        /**
    *@dev allows users to query whether parties need to be whitelisted
    */
    function toggleWhitelist() public onlyOwner() returns(bool){
        whitelistOn = !whitelistOn;
        return whitelistOn;
    }

    /**
    *@dev allows for the details of the photo to be viewed
    *@param _tokenId is the address of the new owner
    *@return string  name
    *@return string photographer
    *@return uint256 isenNumber
    *@return uint64 uploadTime
    */
    function getPhoto(uint _tokenId) public view returns(string,string,uint256, uint64){
        Photo memory _photo = photos[_tokenId];
        return (_photo.name,_photo.photographer,_photo.isenNumber,_photo.uploadTime);
    }

  /**
   * @dev This overwrites the transferFrom function to allow the market/auction contract to interact
   * @param _from is the address that the token will be sent from
   * @param _to is the address we are sending the token to
   * @param _tokenId the numeric identifier of a token
  */
  function transferFrom(address _from, address _to, uint256 _tokenId)  public{
    require((_from == address(0) && allowUploads) ||
        (msg.sender == owner && _from == address(0)) ||
         isApproved(msg.sender,_from) ||
          isApproved(msg.sender,_from,_tokenId) ||
           ownerOf(_tokenId)==msg.sender ||
            msg.sender==marketContract ||
             msg.sender==auctionContract);
    require(!whitelistOn || whitelist[_to] == true);
    clearApprovalAndTransfer(_from,_to,_tokenId);
  }
}
