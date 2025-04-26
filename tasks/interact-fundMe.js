const { task } = require("hardhat/config");

task("interact-fundMe", "interact-fundMe").addParam("addr","fundMe contract address").setAction(async (taskArgs, hre) => {
    const fundMeFactory = await ethers.getContractFactory("FundMe")
    const fundMe = await fundMeFactory.attach(taskArgs.addr)
  // init 2 accounts
  const [firstAccount, sendcondAccount] = await ethers.getSigners();
  // fund contract with first account
  const fundTx = await fundMe.fund({ value: ethers.utils.parseEther("0.05") });
  await fundTx.wait(1);
  // check balance of contract
  const balanceOfContract = await ethers.provider.getBalance(fundMe.target);
  console.log(
    `balance of contract is ${ethers.utils.formatEther(balanceOfContract)}`
  );
  // fund contract with second account
  const fundTx2 = await fundMe
    .connect(sendcondAccount)
    .fund({ value: ethers.utils.parseEther("0.05") });
  await fundTx2.wait(1);
  console.log(`funding with second account ${sendcondAccount.address}`);
  // chenck mapping
  const firstAccountBalaceInFundMe = await fundMe.fundersToAmount(
    firstAccount.address
  );
  const seconftAccountBalaceInFundMe = await fundMe.fundersToAmount(
    sendcondAccount.address
  );
  console.log(
    `first account balance in fundMe is ${ethers.utils.formatEther(
      firstAccountBalaceInFundMe
    )}`
  );
  console.log(
    `second account balance in fundMe is ${ethers.utils.formatEther(
      seconftAccountBalaceInFundMe
    )}`
  );
});

module.exports = {}
