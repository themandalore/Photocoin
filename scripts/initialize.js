var PhotoMarket = artifacts.require("PhotoMarket");
var PhotoCore = artifacts.require("PhotoCore");
var testAuction = artifacts.require("testAuction");

module.exports =async function(accounts) {
	market = await PhotoMarket.deployed();
    core =await PhotoCore.deployed();
    auction = await testAuction.deployed();
	await market.setToken(core.address);
	await core.setMarket(market.address);
	await core.setAuction(auction.address);
	await auction.setToken(core.address);
	await core.setWhitelist(market.address,true);
	await core.setWhitelist(auction.address,true);
}
