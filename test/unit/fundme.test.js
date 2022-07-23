const { localChains } = require("../../helper-hardhat.config.js")
const { network, getNamedAccounts, ethers, deployments } =  require("hardhat")
const { assert, expect } = require("chai")

!localChains.includes(network.name) ? describe.skip :
describe("FundMe", () => {
    let deployer, fundMe, priceFeed
    let amount = ethers.utils.parseEther("1")

    beforeEach(async () => {
        const { deployer: _deployer } = await getNamedAccounts()
        deployer = _deployer

        await deployments.fixture(['all'])

        fundMe = await ethers.getContract("FundMe", deployer)
        priceFeed = await ethers.getContract("MockV3Aggregator", deployer)
    })

    describe("constructor", () => {
        it('should set price feed', async function () {
            const response = await fundMe.getPriceFeed()
            assert.equal(response, priceFeed.address)
        });
    })

    describe("fund", () => {
        it('should fail when not enough amount', async function () {
            await expect(fundMe.fund()).to.be.revertedWith("FundMe__NotEnoughAmount")
        });

        it("should fund", async function () {
            await fundMe.fund({value: amount})
            const response = await fundMe.provider.getBalance(fundMe.address)
            assert.equal(response.toString(), amount.toString())
        })
    })

    describe("withdraw", () => {
        beforeEach(async () => {
            await fundMe.fund({ value: amount })
        })

        it("Only allows the owner to withdraw", async function () {
            const accounts = await ethers.getSigners()
            const fundMeConnectedContract = await fundMe.connect(
                accounts[1]
            )
            await expect(
                fundMeConnectedContract.withdraw()
            ).to.be.revertedWith("FundMe__NotOwner")
        })

        it("Withdraws the funds", async function () {
            await fundMe.fund({value: amount})
            await fundMe.withdraw()
            const response = await fundMe.provider.getBalance(fundMe.address)
            assert.equal(response.toString(), "0")
        })

        it("withdraws ETH from a single funder", async () => {
            // Arrange
            const startingFundMeBalance =
                await fundMe.provider.getBalance(fundMe.address)
            const startingDeployerBalance =
                await fundMe.provider.getBalance(deployer)

            // Act
            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait()
            const { gasUsed, effectiveGasPrice } = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)

            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const endingDeployerBalance =
                await fundMe.provider.getBalance(deployer)

            // Assert
            // Maybe clean up to understand the testing
            assert.equal(endingFundMeBalance, 0)
            assert.equal(
                startingFundMeBalance
                    .add(startingDeployerBalance)
                    .toString(),
                endingDeployerBalance.add(gasCost).toString()
            )
        })
    })
})