const networks = {
    4: {
        name: "rinkeby",
        priceFeedAddress: "0x8A753747A1Fa494EC906cE90E9f37563A8AF630e",
    },
    31337: {
        name: "localhost",
    }
}

const localChains = ["localhost", "hardhat"];

module.exports = {
    networks,
    localChains,
};