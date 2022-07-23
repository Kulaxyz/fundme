const { network, deployments } =  require("hardhat")
const { localChains, networks } = require("../helper-hardhat.config.js")
const { verify } = require("../utils/verify.js")

module.exports = async ({ deployments, getNamedAccounts }) => {
    const chanId = network.config.chainId;
    const { deployer } = await getNamedAccounts()
    let priceFeed

    if (localChains.includes(network.name)) {
        const aggregator = await deployments.get("MockV3Aggregator")
        priceFeed = aggregator.address
    } else {
        priceFeed = networks[chanId].priceFeedAddress
    }

    const fundMe = await deployments.deploy("FundMe", {
        from: deployer,
        args: [priceFeed],
        log: true,
        contract: "FundMe",
        waitConfirmations: network.config.blockConfirmations,
    })

    if (!localChains.includes(network.name)) {
        await verify(fundMe.address, [priceFeed])
    }
}

module.exports.tags = ["all", "deploy"]