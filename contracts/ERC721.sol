pragma solidity ^0.4.18;

import "./library/SafeMath.sol";
import "./library/ERC721Receiver.sol";
import "./library/AddressUtils.sol";

/**
 * @title ERC721Token
 * Implementation for the required functionality of the ERC721 standard
 * www.erc721.org as of 3/5/2018
 */
contract ERC721 {
  using SafeMath for uint256;
  using AddressUtils for address;
  //The total number of tokens in existence
  uint256 public totalTokens;
      // Equals to `bytes4(keccak256("onERC721Received(address,uint256,bytes)"))`
  // which can be also obtained as `ERC721Receiver(0).onERC721Received.selector`
  bytes4 constant ERC721_RECEIVED = 0xf0b9e5ba;
  //A list of functions / interfaces supported by this contract
  mapping(bytes4 => bool) internal supportedInterfaces;
  //A mapping from the token ID to the owner of the token.
  mapping(uint256 => address) tokenOwner;
  //A mapping from tokenIDs to an address that has been approved to call
  mapping(uint256 => address) tokenApproval;
  // Mapping from owner to list of owned token IDs
  mapping(address => uint256[]) ownedTokens;
  // Mapping from token ID to index of the owner tokens list
  mapping(uint256 => uint256) ownedTokensIndex;
  //For assigning a total control of all tokens owned
  mapping(address => address) approvedForAll;

  event Transfer(address indexed _from, address indexed _to, uint256 _tokenId);
  event ApprovalForAll(address indexed _owner, address indexed _operator, bool _approved);
  event Approval(address indexed _owner, address indexed _operator, uint256 _tokenId);

  /**
  * @dev Guarantees msg.sender is owner of the given token
  * @param _tokenId uint256 ID of the token to validate its ownership belongs to msg.sender
  */
  modifier onlyOwnerOf(uint256 _tokenId) {
    require(ownerOf(_tokenId) == msg.sender);
    _;
  }

  /***FUNCTIONS***/
    /**
   * @dev Constructor, it sets the interfaces (ERC721, ERC165)
  */
  function ERC721() public{
    setInterface();
  }

  /**
   * @dev Checks if this contract meeets a specific standard
   * @param interfaceID bytes4 of the bytecode of a specific function or group of functions
   * @return bool representing whether the bytecode is supported
  */
  function supportsInterface(bytes4 interfaceID) external view returns (bool) {
        return supportedInterfaces[interfaceID];
  }

  

  /** 
   * @dev Transfers a specific pet from one address to another
   * @param _from is the address that the token will be sent from
   * @param _to is the address we are sending the token to
   * @param _tokenId the numeric identifier of a token
  */
  function transferFrom(address _from, address _to, uint256 _tokenId) public{
    transferFrom(_from,_to,_tokenId,"");
  }

  /**
  * @dev This overload transferFrom function is required on ERC721.org
  * @param _from is the address that the token will be sent from
  * @param _to is the address we are sending the token to
  * @param _tokenId the uint256 numeric identifier of a token
  * @param _data is the bytes data which will be logged with the transfer
  */
  function transferFrom(address _from, address _to, uint256 _tokenId, bytes _data) public{
    require(approvedFor(_tokenId)==msg.sender || isApproved(msg.sender,_from)|| ownerOf(_tokenId)==msg.sender);
    require (_to != address(0));
    clearApprovalAndTransfer(_from,_to,_tokenId);
  }


  /** 
   * @dev Transfers a specific pet from one address to another
   * @param _from is the address that the token will be sent from
   * @param _to is the address we are sending the token to
   * @param _tokenId the numeric identifier of a token
  */
  function safeTransferFrom(address _from, address _to, uint256 _tokenId) public{
      safeTransferFrom(_from, _to, _tokenId,"");
  }

  /**
  * @dev This overload transferFrom function is required on ERC721.org
  * @param _from is the address that the token will be sent from
  * @param _to is the address we are sending the token to
  * @param _tokenId the uint256 numeric identifier of a token
  * @param _data is the bytes data which will be logged with the transfer
  */
  function safeTransferFrom(address _from, address _to, uint256 _tokenId, bytes _data) public{
    transferFrom(_from, _to, _tokenId);
    require(checkAndCallSafeTransfer(_from, _to, _tokenId, _data));
  }



  /**
  * @dev This function approves or dissaproves another address for control over the tokens owned by the sender
  * @param _operator is the address that will be approved by the sender
  * @param _approved is a bool with true as approve, false to remove approval
  */
  function setApprovalForAll(address _operator, bool _approved) public{
        if(_approved){
          approvedForAll[msg.sender] = _operator;
        }
        else{
          approvedForAll[msg.sender] = address(0);
        }
        ApprovalForAll(msg.sender,_operator,_approved);
  }

  /**
  * @dev Gets the total amount of tokens stored by the contract
  * @return uint256 representing the total amount of tokens
  */
  function totalSupply() public view returns (uint256) {
    return totalTokens;
  }

  /**
  * @dev Gets the balance of the specified address
  * @param _owner address to query the balance of
  * @return uint256 representing the amount owned by the passed address
  */
  function balanceOf(address _owner) public view returns (uint256) {
    return ownedTokens[_owner].length;
  }

  /**
  * @dev Gets the list of tokens owned by a given address
  * @param _owner address to query the tokens of
  * @return uint256[] representing the list of tokens owned by the passed address
  */
  function tokensOf(address _owner) public view returns (uint256[]) {
    return ownedTokens[_owner];
  }

  /**
  * @dev Gets the owner of the specified token ID
  * @param _tokenId uint256 ID of the token to query the owner of
  * @return owner address currently marked as the owner of the given token ID
  */
  function ownerOf(uint256 _tokenId) public view returns (address) {
    address owner = tokenOwner[_tokenId];
    return owner;
  }

  /**
   * @dev Gets the approved address to take ownership of a given token ID
   * @param _tokenId uint256 ID of the token to query the approval of
   * @return address currently approved to take ownership of the given token ID
   */
  function approvedFor(uint256 _tokenId) public view returns (address) {
    return tokenApproval[_tokenId];
  }

  /**
  * @dev This function checks whether an address has control over the tokens owned by another address
  * @param _operator is the approved address
  * @param _owner is the address to be checked if they gave approval
  */
  function isApproved(address _operator, address _owner) public constant returns (bool){
    return(approvedForAll[_owner] == _operator);
  }
  
  /**
  * @dev This function checks whether an address has control over a specific token owned by another address
  * @param _operator is the approved address
  * @param _owner is the address to be checked if they gave approval
  * @param _tokenId uint256 ID of the token to query the approval of
  */
  function isApproved(address _operator, address _owner, uint256 _tokenId) public constant returns (bool){
      return(tokenApproval[_tokenId] == _operator && ownedTokens[_owner][ownedTokensIndex[_tokenId]] == _tokenId);
  }
  /**
  * @dev Approves another address to claim for the ownership of the given token ID
  * @param _to address to be approved for the given token ID
  * @param _tokenId uint256 ID of the token to be approved
  */
  function approve(address _to, uint256 _tokenId) public onlyOwnerOf(_tokenId) {
    require(_to != msg.sender);
    tokenApproval[_tokenId] = _to;
    Approval(msg.sender, _to, _tokenId);
  }

      /***INTERNAL FUNCTIONS***/
  /**
  * @dev Internal function to clear current approval and transfer the ownership of a given token ID
  * @param _from address which you want to send tokens from
  * @param _to address which you want to transfer the token to
  * @param _tokenId uint256 ID of the token to be transferred
  */
  function clearApprovalAndTransfer(address _from, address _to, uint256 _tokenId) internal {
    require(_to != address(0));
    require(_to != ownerOf(_tokenId));
    require(ownerOf(_tokenId) == _from );
    tokenApproval[_tokenId] = address(0);
    if(_from != address(0)){
      removeToken(_from, _tokenId);
    }
    addToken(_to, _tokenId);
    Transfer(_from, _to, _tokenId);
  }
  /**
  * @dev Internal function to add a token ID to the list of a given address
  * @param _to address representing the new owner of the given token ID
  * @param _tokenId uint256 ID of the token to be added to the tokens list of the given address
  */
  function addToken(address _to, uint256 _tokenId) internal {
    require(tokenOwner[_tokenId] == address(0));
    tokenOwner[_tokenId] = _to;
    uint256 length = balanceOf(_to);
    ownedTokens[_to].push(_tokenId);
    ownedTokensIndex[_tokenId] = length;
    totalTokens = totalTokens.add(1);
  }
  /**
  * @dev Internal function to remove a token ID from the list of a given address
  * @param _from address representing the previous owner of the given token ID
  * @param _tokenId uint256 ID of the token to be removed from the tokens list of the given address
  */
  function removeToken(address _from, uint256 _tokenId) internal {
    require(ownerOf(_tokenId) == _from);
    uint256 tokenIndex = ownedTokensIndex[_tokenId];
    uint256 lastTokenIndex = balanceOf(_from).sub(1);
    uint256 lastToken = ownedTokens[_from][lastTokenIndex];
    tokenOwner[_tokenId] = 0;
    ownedTokens[_from][tokenIndex] = lastToken;
    ownedTokens[_from][lastTokenIndex] = 0;
    // Note that this will handle single-element arrays. In that case, both tokenIndex and lastTokenIndex are going to
    // be zero. Then we can make sure that we will remove _tokenId from the ownedTokens list since we are first swapping
    // the lastToken to the first position, and then dropping the element placed in the last position of the list
    ownedTokens[_from].length--;
    ownedTokensIndex[_tokenId] = 0;
    ownedTokensIndex[lastToken] = tokenIndex;
    totalTokens = totalTokens.sub(1);
  }

  /** 
   * @dev States that code is stating that this contract meets ERC721 and ERC165 specifications
  */
  function setInterface() internal{
          supportedInterfaces[this.supportsInterface.selector
           ^ bytes4(keccak256("transferFrom(address,address,uint256)"))
           ^ bytes4(keccak256("transferFrom(address,address,uint256,bytes)"))
           ^ this.totalSupply.selector
           ^ this.setApprovalForAll.selector
           ^ this.balanceOf.selector
           ^ this.ownerOf.selector
           ^ bytes4(keccak256("isApproved(address,address)"))
           ^ bytes4(keccak256("isApproved(address,address,uint256)"))
           ^ this.approve.selector
          ] = true;
          supportedInterfaces[this.supportsInterface.selector
          ] = true;
  }

  
    /**
  * @dev Internal function to invoke `onERC721Received` on a target address
  * @dev The call is not executed if the target address is not a contract
  * @param _from address representing the previous owner of the given token ID
  * @param _to target address that will receive the tokens
  * @param _tokenId uint256 ID of the token to be transferred
  * @param _data bytes optional data to send along with the call
  * @return whether the call correctly returned the expected magic value
  */
  function checkAndCallSafeTransfer(
    address _from,
    address _to,
    uint256 _tokenId,
    bytes _data
  )
    internal
    returns (bool)
  {
    if (!_to.isContract()) {
      return true;
    }
    bytes4 retval = ERC721Receiver(_to).onERC721Received(_from, _tokenId, _data);
    return (retval == ERC721_RECEIVED);
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
  function onERC721Received(address, uint256, bytes) public view returns(bytes4) {
    return ERC721_RECEIVED;
  }
}