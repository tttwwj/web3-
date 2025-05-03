const { assert, expect } = require("chai");
const { ethers, deployments, getNamedAccounts } = require("hardhat");
const helpers = require("@nomicfoundation/hardhat-network-helpers");
const {devlopmentChains} = require("../../helper-hardhat-config");

!devlopmentChains.includes(network.name) ? describe.skip :
describe("test fundMe contract", async function () {
  let fundMe;
  let fundMeSecondAccount;
  let firstAccount;
  let secondAccount;
  let mockV3Aggregator;
  beforeEach(async function () {
    await deployments.fixture(["all"]);
    firstAccount = (await getNamedAccounts()).firstAccount;
    secondAccount = (await getNamedAccounts()).secondAccount;
    const fundMeDeployment = await deployments.get("FundMe");
    mockV3Aggregator = await deployments.get("MockV3Aggregator");
    fundMe = await ethers.getContractAt("FundMe", fundMeDeployment.address);
    fundMeSecondAccount = await ethers.getContract("FundMe", secondAccount)
  });

  it("test if the owner is msg.sender", async function () {
    await fundMe.waitForDeployment();
    assert.equal(firstAccount, await fundMe.owner());
  });

  it("test if the dataFeed is assertd correctly ", async function () {
    await fundMe.waitForDeployment();
    assert.equal(mockV3Aggregator.address, await fundMe.dataFeed());
  });

  it("window closed, value grater than minimum, fund failed", async function () {
    // make sure the window is closed
    await helpers.time.increase(200);
    await helpers.mine();
    //value is greater minimum value
    await expect(
      fundMe.fund({ value: ethers.parseEther("0.1") })
    ).to.be.revertedWith("window is closed");
  });

  it("window open, value less than minimum, fund failed", async function () {
    expect(
      await fundMe.fund({ value: ethers.parseEther("0.01") })
    ).to.be.revertedWith("send more ETH!");
  });

  it("window open, value grater than minimum, fund success", async function () {
    await fundMe.fund({ value: ethers.parseEther("0.1") })
     const balance = await fundMe.fundersToAmount(firstAccount)
     expect(balance).to.be.equal(ethers.parseEther("0.1"));
  });

  it("not onwer,window closed, target reached, getFund failed", async function () {
    await fundMe.fund({ value: ethers.parseEther("1") })
    // make sure the window is closed
    await helpers.time.increase(200);
    await helpers.mine();
    await expect(fundMeSecondAccount.getFund()).to.be.revertedWith("this function can only be called by owner");
  });

  it("window open, target reached", async function () {
    await fundMe.fund({ value: ethers.parseEther("1") })
    await expect(fundMe.getFund()).to.be.revertedWith("window is not closed");
  });

  it("window closed, target not reached, getFund failed", async function () {
    await fundMe.fund({ value: ethers.parseEther("0.01") })

    await helpers.time.increase(200);
    await helpers.mine();
    await expect(fundMe.getFund()).to.be.revertedWith("Target is not reached");
  });

  it("window closed, target reached, getFund success", async function () {
    await fundMe.fund({ value: ethers.parseEther("1") })

    await helpers.time.increase(200);
    await helpers.mine();
    await expect(fundMe.getFund()).to.emit(fundMe,"FundWithdrawByOwner").withArgs(ethers.parseEther("1"));
  });

  it("window open, target not reached, funder has balance", async function () {
    await fundMe.fund({ value: ethers.parseEther("0.01") })
    await expect(fundMe.refund()).to.be.revertedWith("window is not closed");
  });

  it("window closed, target reached, funder has balance", async function () {
    await fundMe.fund({ value: ethers.parseEther("1") })
    await helpers.time.increase(200);
    await helpers.mine();
    await expect(fundMe.refund()).to.be.revertedWith("Target is reached");
  });

  it("window closed, target not reached, funder does not balance", async function () {
    await fundMe.fund({ value: ethers.parseEther("0.01") })
    await helpers.time.increase(200);
    await helpers.mine();
    await expect(fundMeSecondAccount.refund()).to.be.revertedWith("there is no fund for you");
  });

  it("window closed, target reached, funder has balance", async function () {
    await fundMe.fund({ value: ethers.parseEther("0.01") })
    await helpers.time.increase(200);
    await helpers.mine();
    await expect(fundMe.refund()).to.emit(fundMe,"RefundWithdrawByOwner").withArgs(firstAccount ,ethers.parseEther("0.01"));
  });

});
