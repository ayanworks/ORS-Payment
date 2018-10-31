pragma solidity ^0.4.23;

contract ORSTokenInterface {
    function allowance(address owner, address spender) public view returns (uint256);
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool); 
}

contract PaymentInORS {
    
    ORSTokenInterface ORSTokenContract;

    event GetSender(address _addr, address _spender);

    function setORSTokenContractAddress(address _address) external {
        ORSTokenContract = ORSTokenInterface(_address);
    }

    function _transferFrom(address _from, address _to, uint256 _value) public returns(bool){
        return ORSTokenContract.transferFrom(_from, _to, _value);
    }

    function GetAllowance(address owner, address spender) public view returns (uint256) {
        return ORSTokenContract.allowance(owner, spender);
    }
}