const { network } = require("hardhat")
const {
    developmentChains,
    DECIMALS,
    INITIAL_ANSWER,
} = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    if (developmentChains.includes(network.name)) {
        log("Local Network Detected! Deploying Mocks... \n")
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER],
            // These are the parameters of the constructor of the Mock Price Feed Contract we are deploying
        })
        log("Mocks Deployed!")
        log("----------------------------------------------------------")
        //Deploying the Mock of the Real Price Feed contract
    }
}

module.exports.tags = ["all", "mocks"]
