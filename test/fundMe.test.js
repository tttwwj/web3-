const { assert } = require("chai")
const { ethers, deployments , getNamedAccounts} = require("hardhat")

describe("test fundMe contract",async function () {
    this.beforeEach(async function () {
        await deployments.fixture(["all"])
        firstAccount = (await getNamedAccounts()).firstAccount
        const fundMeDeployment = await deployments.get("FundMe")
        fundMe = await ethers.getContractAt("FundMe", fundMeDeployment.address)
    })
        

    it("test if the owner is msg.sender", async function () {
        await fundMe.waitForDeployment()
        assert.equal(firstAccount, await fundMe.owner())
    })

    it("test if the dataFeed is assertd correctly ", async function () {
        await fundMe.waitForDeployment()
        assert.equal("0x694AA1769357215DE4FAC081bf1f309aDC325306", await fundMe.dataFeed())
    })
})