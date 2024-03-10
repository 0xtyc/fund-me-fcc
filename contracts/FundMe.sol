// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "hardhat/console.sol";

contract FundMe {
    address private immutable i_owner; // i for immutable
    mapping(address => uint) public s_addressToAmountFunded; // s for storage variable
    address[] public s_funders; // it's not allowed to iterate over a mapping, so we need to keep track of the keys

    event Withdrawal();

    constructor() {
        i_owner = msg.sender;
    }

    function fund() public payable {
        s_addressToAmountFunded[msg.sender] += msg.value;
        s_funders.push(msg.sender);
    }

    function withdraw() public {
        require(msg.sender == i_owner, "You are not the owner");

        // Reset each funder's contributed amount to 0
        for (uint i = 0; i < s_funders.length; i++) {
            s_addressToAmountFunded[s_funders[i]] = 0;
        }

        payable(msg.sender).transfer(address(this).balance);
        emit Withdrawal();
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }
}
