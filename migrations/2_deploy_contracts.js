var PhotoCore = artifacts.require("./PhotoCore.sol");
var PhotoMarket = artifacts.require("./PhotoMarket.sol");
var Auction = artifacts.require("./Auction.sol")

module.exports = function(deployer) {
  deployer.deploy(PhotoCore);
  deployer.deploy(PhotoMarket);
  deployer.deploy(Auction);
};
