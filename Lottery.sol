// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Lottery{
    address public manager;
    address payable[] public participants;
    uint maxParticipants =10;
    uint entryFee =1 ether;
    constructor()  {
        manager = msg.sender;//msg is sender of current call, contract deployer for a constructor
    }
    event participantsEntered(address indexed  participants);

        modifier Notmanager(){
        require (msg.sender != manager ,"Manager cant Participate Authorized");//restricts the contract deployer from 
                                                                               // participating in the lottery aka manger
        _;
    }
    receive() external payable Notmanager{  
        require(participants.length<maxParticipants,"No more people can participate");   
        require(msg.value==entryFee);            // recieves some amout of ethers from participents
        participants.push(payable (msg.sender));//here the msg.sender denotes the 
        emit participantsEntered(msg.sender);   //address of the partcipant and not the manager
    } 
    modifier OnlyManager(){
        require(msg.sender == manager ,"Not Authorized");
        _;
    }
     function getBalance() public view  OnlyManager returns (uint)
    {
        return address(this).balance;
    }
    function random() public view returns(uint){
        return uint(keccak256(abi.encodePacked(block.prevrandao,block.timestamp,participants.length)));
    }


    event WinnerSelected(address indexed winner,uint win_amount);
    function Selectwinner() public OnlyManager{ //Only Manager gives the manager the authority to select winner 
        require(participants.length>=3);  // min participants should be 3 or greater 
        uint r = random(); 
        uint prize = getBalance(); // here I am storing the balance or the winning amt in a local varibale
                                   // prize . As the balance gets already trasfered . and there will be 0 eth to log  
        address payable winner;
        uint index = r % participants.length;        
        winner=participants[index];
        winner.transfer(prize);
        emit WinnerSelected(winner, prize);
        participants=new address payable [](0);//restars the lottery Contract
    }
     
}