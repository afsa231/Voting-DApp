//SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract voting {

  uint[3] private votes; //3-leaders
  mapping (address => bool) public voters; //who have polled
  constructor() public {
    votes[0]=0;
    votes[1]=0;
    votes[2]=0; //resetting the values

  }

  //function to cast vote
  function castVote(uint id) public{
    require(!voters[msg.sender]);

    voters[msg.sender]=true;
    if(id==0){
      votes[0]+=1;
    }
    else if(id==1){
      votes[1]+=1;
    }
    else if(id==2){
      votes[2]+=1;
    }

  }
  function viewVotes() public view returns(uint[3] memory){
    return(votes);
  }
}




