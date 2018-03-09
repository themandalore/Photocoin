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

    /*** DATA TYPES ***/
    /// @dev The main Photo struct
    struct Photo {
        uint256 isenNumber;// The unique ISEN number
        uint64 uploadTime;// The timestamp from the block when this came into existence
    }
    /*** STORAGE ***/
    mapping(bytes32 => Photo) photos;//A mapping from photoId to the details of the photo
    mapping(address => bool) whitelist;// A list of addresses approved to trade

    /***MODIFIERS***/
    /// @dev Access modifier for Owner functionality
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

        /// @dev Access modifier for Owner functionality
    modifier onlyWhitelist() {
        require(whitelist[msg.sender] == true);
        _;
    }

    /*** EVENTS ***/
    /// @dev The Upload event is fired whenever a new photo is uploaded
    event Upload(address indexed _owner, bytes32 _photoId, uint _uploadTime);


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
    *@dev allows the owner to set the official marketplace of the token
    *@param _market is the address of the PetMarket contract
    */
    function setMarket(address _user) public onlyOwner() {
        whitelist[_user] = true;
    }

    /**
    *@dev allows for the details of the pet to be viewed
    *@param _tokenId is the address of the new owner
    *@return string kind
    *@return string genes
    *@return uint64 birthTime
    *@return uint256 experience
    */
    function getPhoto(uint _tokenId) public view returns(string, string, uint64){
        Photo memory _photo = photos[_tokenId];
        return (_photo.kind,_photo.genes,_photo.birthTime);
    }

  /**
   * @dev This overwrites the transferFrom function to allow the market contract to interact
   * @param _from is the address that the token will be sent from
   * @param _to is the address we are sending the token to
   * @param _tokenId the numeric identifier of a token
  */
  function transferFrom(address _from, address _to, uint256 _tokenId) public{
    require(msg.sender == owner || isApproved(msg.sender,_from) || isApproved(msg.sender,_from,_tokenId) || ownerOf(_tokenId)==msg.sender || msg.sender==marketContract);
    clearApprovalAndTransfer(_from,_to,_tokenId);
  }
}
