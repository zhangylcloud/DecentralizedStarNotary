pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";

contract StarNotary is ERC721 { 

    struct Star { 
        string name; 
        string ra;
        string dec;
        string mag;
        string story;
    }

    mapping(uint256 => Star) public tokenIdToStarInfo; 
    mapping(uint256 => uint256) public starsForSale;
    //Uniquely maps hash of coordinate to a boolean, indicating if that star exists.
    mapping(bytes32 => bool) public starMap;

    function createStar(string _name, string _ra, string _dec, string _mag, string _story, uint256 _tokenId) public { 
        Star memory newStar = Star(_name, _ra, _dec, _mag, _story);

        //require(this.isStarInfoConformToRequirement(_ra, _dec, _mag), "Star doesn't conform to required format");

        require(!this.checkIfStarExist(_ra, _dec, _mag), "Star already exists");

        tokenIdToStarInfo[_tokenId] = newStar;
        starMap[keccak256(abi.encodePacked(_ra, _dec, _mag))] = true;

        _mint(msg.sender, _tokenId);
    }

    //function isStarInfoConformToRequirement(string _ra, string _dec, string _mag) public view returns (bool){
    //    return (!compareStrings(_ra, "") && !compareStrings(_dec, "") && !compareStrings(_mag, ""));
    //}

//    function compareStrings(string a, string b) public view returns (bool){
//        return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
//    }

    function checkIfStarExist(string _ra, string _dec, string _mag) public view returns (bool) {
        return starMap[keccak256(abi.encodePacked(_ra, _dec, _mag))] == true;
    }

    function putStarUpForSale(uint256 _tokenId, uint256 _price) public { 
        require(this.ownerOf(_tokenId) == msg.sender);

        starsForSale[_tokenId] = _price;
    }

    function buyStar(uint256 _tokenId) public payable { 
        require(starsForSale[_tokenId] > 0);
        
        uint256 starCost = starsForSale[_tokenId];
        address starOwner = this.ownerOf(_tokenId);
        require(msg.value >= starCost);

        _removeTokenFrom(starOwner, _tokenId);
        _addTokenTo(msg.sender, _tokenId);
        
        starOwner.transfer(starCost);

        if(msg.value > starCost) { 
            msg.sender.transfer(msg.value - starCost);
        }
    }

    //_mint is an internal function. In order to test mint, create a public mint here
    function mint(address _to, uint256 _tokenId) public{
        super._mint(_to, _tokenId);
    }
}