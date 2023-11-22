const AuctionLogic = artifacts.require("AuctionLogic");

module.exports = async function (deployer) {
  
  // Deployer Account = accounts[0] -> contract owner
  
  const deployerAccount = "0xEcBCBb591f5cF28e04964C5709f2032DA96bA4aC"; // deployer account
  deployer.deploy(AuctionLogic, { from: deployerAccount });
};
