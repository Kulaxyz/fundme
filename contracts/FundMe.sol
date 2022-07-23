// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "./PriceConverter.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

error FundMe__NotOwner();
error FundMe__NotEnoughAmount();
error FundMe__WithdrawFail();

contract FundMe {
    using PriceConverter for uint256;

    address private immutable i_owner;
    address[] public s_funders;
    mapping(address => uint256) public s_addressToAmount;
    mapping(address => string) public s_addressToComment;
    uint public constant minAmount = 1 * 1e15;
    uint public constant minAmountUsd = 50;
    uint256 public highestValue = 0;

    AggregatorV3Interface private priceFeed;

    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        priceFeed = AggregatorV3Interface(priceFeedAddress);
    }


    function fund(string memory _comment) public payable {
        if(msg.value.toUsd(priceFeed) < minAmountUsd) revert FundMe__NotEnoughAmount();
        s_funders.push(msg.sender);
        s_addressToAmount[msg.sender] = s_addressToAmount[msg.sender] + msg.value;
        // highestValue = max(highestValue, s_addressToAmount[msg.sender])
        if(s_addressToAmount[msg.sender] > highestValue) {
            highestValue = s_addressToAmount[msg.sender];
        }
        s_addressToComment[msg.sender] = _comment;
    }

    function getTopFund() public view returns(uint) {
        return highestValue;
    }

    function withdraw() public onlyOwner {
        uint256 len = s_funders.length;
        for(uint256 i = 0; i < len; i++) {
            s_addressToAmount[s_funders[i]] = 0;
        }
        s_funders = new address[](0);
        (bool success,) = payable(msg.sender).call{value: address(this).balance}("");
        if(!success) revert FundMe__WithdrawFail();
    }

    function getPriceFeed() public view returns(AggregatorV3Interface) {
        return priceFeed;
    }

    modifier onlyOwner() {
        if(msg.sender != i_owner) revert FundMe__NotOwner();
        _;
    }
}