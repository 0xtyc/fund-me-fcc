// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "hardhat/console.sol";

contract FundMe {
    address private immutable i_owner; // owner of this contract

    event Withdrawal(uint amount, uint when);

    constructor() {
        i_owner = msg.sender;
    }

    function fund() public {}

    function withdraw() public {}
}
