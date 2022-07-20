const { network, getNamedAccounts } =  require("hardhat")
const { localChains } = require("../helper-hardhat.config.js")

module.exports = async ({ deployments, getNamedAccounts }) => {
    if (localChains.includes(network.name)) {
        const { deployer } = await getNamedAccounts()
        console.log("deployer is " +  deployer)
        await deployments.deploy("MockV3Aggregator", {
            from: deployer,
            contract: "MockV3Aggregator",
            args: [8, 1000],
            log: true,
        })
        console.log("MockV3Aggregator deployed")
    }
}

module.exports.tags = ["all", "mocks"]