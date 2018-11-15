pragma solidity ^0.4.23;

import "../zeppelin-solidity/contracts/ownership/Ownable.sol";

contract AcceptETH is Ownable{
    
    event SendEvent(address _sender, uint _value);
    
    function acceptEther() external payable {
        require(msg.value > 0, "Incorrect package amount");
        owner.transfer(msg.value);
        emit SendEvent(msg.sender, msg.value);
    }
}