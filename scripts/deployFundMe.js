const {ethers} = require("hardhat")


async function main() {
     // create factory 
     const fundMeFactory = await ethers.getContractFactory("FundMe")
     console.log("contract deploying")
     // deploy contract from factory
     const fundMe = await fundMeFactory.deploy(10)
     await fundMe.waitForDeployment()
     console.log(`contract has been deployed successfully, contract address is ${fundMe.target}`);
 
     // verify fundme
     console.log(`ETHERSCAN_API_KEY ${process.env.ETHERSCAN_API_KEY}`);
     if(hre.network.config.chainId == 11155111 && process.env.ETHERSCAN_API_KEY) {
         console.log("Waiting for 5 confirmations")
         await fundMe.deploymentTransaction().wait(10) 
         await verifyFundMe(fundMe.target, [10])
     } else {
         console.log("verification skipped..")
     }
}

// init 2 accounts
const [firstAccount, sendcondAccount] = await ethers.getSigners()
// fund contract with first account
const fundTx = await fundMe.fund({value: ethers.utils.parseEther("0.05")})
await fundTx.wait(1)
// check balance of contract
const balanceOfContract = await ethers.provider.getBalance(fundMe.target)
console.log(`balance of contract is ${ethers.utils.formatEther(balanceOfContract)}`);
// fund contract with second account
const fundTx2 = await fundMe.connect(sendcondAccount).fund({value: ethers.utils.parseEther("0.05")})
await fundTx2.wait(1)
console.log(`funding with second account ${sendcondAccount.address}`);
// chenck mapping
const firstAccountBalaceInFundMe =  await fundMe.fundersToAmount(firstAccount.address)
const seconftAccountBalaceInFundMe =  await fundMe.fundersToAmount(sendcondAccount.address)
console.log(`first account balance in fundMe is ${ethers.utils.formatEther(firstAccountBalaceInFundMe)}`);
console.log(`second account balance in fundMe is ${ethers.utils.formatEther(seconftAccountBalaceInFundMe)}`);

async function verifyFundMe(fundMeAddr, args) {
    await hre.run("verify:verify", {
        address: fundMeAddr,
        constructorArguments: args,
      });
}
main().then().catch((error) => {
    console.error(error)
    process.exit(0)
})