const { assert, expect } = require("chai");
const { ethers, deployments, getNamedAccounts } = require("hardhat");
const helpers = require("@nomicfoundation/hardhat-network-helpers");
const {devlopmentChains} = require("../../helper-hardhat-config");

devlopmentChains.includes(network.name) ? describe.skip :
describe("test fundMe contract", async function () {
  let fundMe;
  let firstAccount;

  beforeEach(async function () {
    await deployments.fixture(["all"]);
    firstAccount = (await getNamedAccounts()).firstAccount;
    const fundMeDeployment = await deployments.get("FundMe");
    fundMe = await ethers.getContractAt("FundMe", fundMeDeployment.address);
  });

  it("fund and getFund successful", async function () {
    await fundMe.fund({ value: ethers.utils.parseEther("0.5") });
    await new Promise((resolve) => setTimeout(resolve, 181 * 1000)); // wait for the transaction to be mined
    const getFundTx = await fundMe.getFund();
    const getFundReceipt = await getFundTx.wait();
    expect(getFundReceipt)
      .to.be.emit(fundMe, "FundWithdrawByOwner")
      .withArgs(ethers.parseEther("0.5"));
  });

  it("fund and refund successful", async function () {
    await fundMe.fund({ value: ethers.utils.parseEther("0.1") });
    await new Promise((resolve) => setTimeout(resolve, 181 * 1000)); // wait for the transaction to be mined
    const getRefundTx = await fundMe.refund();
    const getRefundReceipt = await getRefundTx.wait();
    expect(getRefundReceipt)
      .to.be.emit(fundMe, "RefundWithdrawByOwner")
      .withArgs(firstAccount,ethers.parseEther("0.1"));
  });
});
