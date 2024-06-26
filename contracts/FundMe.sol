// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

error FundMe__InsufficientFunds();
error FundMe__NotOwner();
error FundMe__NegativePrice();

contract FundMe {
    address private immutable OWNER; // i for immutable
    mapping(address => uint256) public addressToAmountFunded; // s for storage variable
    address[] public funders; // it's not allowed to iterate over a mapping, so we need to keep track of the keys
    uint256 public constant MININUM_FUND_USD = 50 * 1e18;
    event Withdrawal();
    AggregatorV3Interface internal priceFeed;

    constructor(address _priceFeedAddress) {
        OWNER = msg.sender;
        priceFeed = AggregatorV3Interface(_priceFeedAddress);
    }

    function fund() public payable {
        if (getConversionRate(msg.value) < MININUM_FUND_USD) {
            revert FundMe__InsufficientFunds();
        }

        addressToAmountFunded[msg.sender] += msg.value;
        funders.push(msg.sender);
    }

    function withdraw() public {
        if (msg.sender != OWNER) {
            revert FundMe__NotOwner();
        }

        // Reset each funder's contributed amount to 0
        for (uint256 i = 0; i < funders.length; i++) {
            addressToAmountFunded[funders[i]] = 0;
        }

        emit Withdrawal();
        payable(msg.sender).transfer(address(this).balance);
    }

    function getOwner() public view returns (address) {
        return OWNER;
    }

    function getLatestPrice() private view returns (int256) {
        (, int256 price, , , ) = priceFeed.latestRoundData();
        return price;
    }

    function getConversionRate(
        uint256 ethAmount
    ) private view returns (uint256) {
        int256 price = getLatestPrice();
        if (price < 0) {
            revert FundMe__NegativePrice();
        }
        // The price is fetched from a Chainlink oracle and is typically represented as the price of 1 Ether in USD, multiplied by 10^8.
        uint256 priceInUsd = uint256(price) / 1e8;
        return (priceInUsd * ethAmount);
    }

    function getFunderAmount(address funder) public view returns (uint256) {
        return addressToAmountFunded[funder];
    }
}
