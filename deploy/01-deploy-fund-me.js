const { network } = require("hardhat")
const { devlopmentChains, netWorkConfig,LOCK_TIME } = require("../helper-hardhat-config")

module.exports= async ({getNamedAccounts, deployments}) => {
    const {firstAccount} = await getNamedAccounts()
    const {deploy} = deployments
    
    let dataFeedAddress
    if(devlopmentChains.includes(network.name)) {
        dataFeedAddress =  await deployments.get("MockV3Aggregator").address
    } else {
        dataFeedAddress = netWorkConfig[network.config.chainId].ethUsdPriceFeed
    }
    
    await deploy("FundMe", {
        from: firstAccount,
        args: [LOCK_TIME, dataFeedAddress],
        log: true,
    })
}

module.exports.tags = ["all", "fundMe"]