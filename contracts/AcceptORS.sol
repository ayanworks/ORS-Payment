pragma solidity ^0.4.23;

import "../zeppelin-solidity/contracts/ownership/Ownable.sol";

contract ORSTokenInterface {
    
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool); 
}

contract AcceptORS is Ownable {
    
    event TransferFrom(address _from, address _to, uint256 _value, address _sender);

    ORSTokenInterface orsTokenContract;

    function setORSTokenContractAddress(address _address) external onlyOwner {
        orsTokenContract = ORSTokenInterface(_address);
    }

    function acceptAndTransfer(address _from, address _to, uint256 _value) external onlyOwner returns(bool){
      //  emit TransferFrom(_from, _to, _value, msg.sender);
        return orsTokenContract.transferFrom(_from, _to, _value);
    }

}