const { networkConfig, developmentChains } = require("../helper-hardhat-config")
/* Short for 2 lines:
    const helperConfig = require("../helper-hardhat-config")
    const networkConfig = helperConfig.networkConfig
*/
// Imporing the networkconfig from the file to get the price feed address for the respective chainId

const { network, getNamedAccounts, deployments } = require("hardhat")
const { verify } = require("../utils/verify")

// getNamedAccounts and deployments come from hre (hardhat runtime environment)
module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    // For different networks, we'll have different addresses for Price Feeds
    // Using an approach which Aave uses - a helper config file
    let ethUsdPriceFeedAddress
    
    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        // get the mock contract object from a previous deployment
        ethUsdPriceFeedAddress = ethUsdAggregator.address
        // get the address of that mock contract object
        // your deployed mock contract acts as the ethUsd priceFeed
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }

    // Chainlink Price Feeds do not exist on Hardhat local environment. We can't keep on testing on test networks due to balance and time constraints.
    // So we use a mock contract of the real price feed.
    // a mock is a replica of the real object which simulates the real object 1:1
    // Since Price Feed is a contract , a mock would also be a contract and thus needing a deploy script
    const args = [ethUsdPriceFeedAddress]
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args, // Put priceFeedAddress
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    // deploying the fund me contract

    // Verifying the contract
    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, args)
    }
    log("----------------------------------------------------------")
}

module.exports.tags = ["all", "fundme"]
