// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

//Interface object gets compiled to an ABI, an ABI matched with an address gives you a contract

library PriceConverter {
    // returns price of eth in usd
    function getPrice(AggregatorV3Interface priceFeed)
        internal
        view
        returns (uint256)
    {
        //Address ETH/USD Chainlink Oracle : 0x8A753747A1Fa494EC906cE90E9f37563A8AF630e
        // AggregatorV3Interface priceFeed = AggregatorV3Interface(
        //     0x8A753747A1Fa494EC906cE90E9f37563A8AF630e
        // );

        //Extrapolating the required value into a variable
        (, int256 price, , , ) = priceFeed.latestRoundData();

        // * 1e10 to match it with default 1e18 wei (By default this price feed has 8 decimal places)
        return uint256(price * 1e10);
    }

    function getConversionRate(
        uint256 ethAmount,
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        uint256 ethPrice = getPrice(priceFeed);
        uint256 ethAmountInUsd = (ethPrice * ethAmount) / 1e18;
        return ethAmountInUsd;
    }
}
