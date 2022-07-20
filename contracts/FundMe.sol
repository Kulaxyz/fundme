// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "./PriceConverter.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

error FundMe__NotOwner();
error FundMe__NotEnoughAmount();

contract FundMe {
    using PriceConverter for uint256;

    address private immutable i_owner;
    address[] public s_funders;
    mapping(address => uint256) public addressToAmount;
    mapping(address => string) public s_addressToComment;
    uint public constant minAmount = 1 * 1e15;
    uint public constant minAmountUsd = 50;
    uint256 public constant highestValue = 0;

    AggregatorV3Interface private priceFeed;

    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        priceFeed = AggregatorV3Interface(priceFeedAddress);
    }


    function fund() public payable {
        require(msg.value.toUsd(priceFeed) >= minAmountUsd, "FundMe__NotEnoughAmount");
        funders.push(msg.sender);
        addressToAmount[msg.sender] = addressToAmount[msg.sender] + msg.value;
        // highestValue = max(highestValue, addressToAmount[msg.sender])
        if(addressToAmount[msg.sender] > highestValue) {
            highestValue = addressToAmount[msg.sender];
        }
        s_addressToComment[msg.sender] = "_comment";
    }

    function getTopFund() public view returns(uint) {
        return highestValue;
    }

    function withdraw() public onlyOwner {
        uint256 len = s_funders.length;
        for(uint256 i = 0; i < len; i++) {
            s_addressToAmount[funders[i]] = 0;
        }
        funders = new address[](0);
        (bool success,) = payable(msg.sender).call{value: address(this).balance}("");
        require(success, "Fail");
    }

    function getPriceFeed() public view returns(AggregatorV3Interface) {
        return priceFeed;
    }

    modifier onlyOwner() {
        require(msg.sender == i_owner, "FundMe__NotOwner");
        _;
    }
}