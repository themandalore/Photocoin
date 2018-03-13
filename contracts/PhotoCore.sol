pragma solidity ^0.4.18;

import "./PhotoBase.sol";

/**
*@title PhotoCore
* Front contract for Photocoin. Holds uploadPhoto funtionality and token name and symbol
*/
contract PhotoCore is PhotoBase{
    // @notice Name and symbol of the non fungible token, as defined in ERC721.
    string public name = "PhotoCoin";
    string public symbol = "PC";

    /**
    *@dev Creates the main Photocoin smart contract instance and sets the owner
    */
    function PhotoCore() public {
        owner = msg.sender;
        whitelist[owner] = true;
    }

    /**
    *@notice No tipping!
    *@dev fallback function to reject all Ether from being sent to contract
    */
    function() external payable {
        require(msg.value == 0);
    }

    /**
    *@dev this is the function to create a new photocoin and update the mappings with a new token
    *@param _photoHash is the hash of the photograph
    *@param _name is a string variable representing the name of the photograph
    *@param _photographer is a string variable representing the name of the photographer
    *@param _isenNumber is the uint ISEN number
    *@param _owner is the address of the new owner of the token
    */
    function uploadPhoto(bytes32 _photoHash,string _name, string _photographer, uint256 _isenNumber, address _owner) public onlyOwner() {
        if(_owner == address(0)) {
            _owner = owner;
        }
        uint256 newId = totalTokens;
        photos[newId] = Photo({
            name: _name,
            photographer: _photographer,
            photoHash: _photoHash,
            isenNumber: _isenNumber,
            uploadTime: uint64(now)
            });
        transferFrom(address(0),_owner,newId);
        Upload(_owner,newId,_photoHash, _name,_photographer,_isenNumber);
    }


}