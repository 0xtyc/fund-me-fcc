// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

import "hardhat/console.sol";

contract FundMe {
    address private immutable i_owner; // i for immutable
    mapping(address => uint) public s_addressToAmountFunded; // s for storage variable
    address[] public s_funders; // it's not allowed to iterate over a mapping, so we need to keep track of the keys
    uint public constant MININUM_FUND_USD = 50 * 1e18;
    event Withdrawal();
    AggregatorV3Interface internal priceFeed;

    constructor(address _priceFeedAddress) {
        i_owner = msg.sender;
        priceFeed = AggregatorV3Interface(_priceFeedAddress);
    }

    function fund() public payable {
        require(
            getConversionRate(msg.value) >= MININUM_FUND_USD,
            "You need to fund more than $50"
        );
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

    function getLatestPrice() private view returns (int) {
        (, int price, , , ) = priceFeed.latestRoundData();
        return price;
    }

    function getConversionRate(uint ethAmount) private view returns (uint) {
        int price = getLatestPrice();
        require(price >= 0, "Price is negative");
        // The price is fetched from a Chainlink oracle and is typically represented as the price of 1 Ether in USD, multiplied by 10^8.
        uint priceInUsd = uint(price) / 1e8;
        return (priceInUsd * ethAmount);
    }
}
