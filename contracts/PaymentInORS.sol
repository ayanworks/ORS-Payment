pragma solidity ^0.4.23;

import "../zeppelin-solidity/contracts/ownership/Ownable.sol";

contract ORSTokenInterface {
    
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool); 
}

contract PaymentInORS is Ownable {
    
    ORSTokenInterface ORSTokenContract;

    function setORSTokenContractAddress(address _address) public onlyOwner {
        ORSTokenContract = ORSTokenInterface(_address);
    }

    function _transferFrom(address _from, address _to, uint256 _value) public onlyOwner returns(bool){
        return ORSTokenContract.transferFrom(_from, _to, _value);
    }

}