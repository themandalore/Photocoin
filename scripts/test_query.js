var PhotoMarket = artifacts.require("PhotoMarket");
var PhotoCore = artifacts.require("PhotoCore");
var testAuction = artifacts.require("testAuction");

module.exports =async function(accounts) {
	market = await PhotoMarket.deployed();
    core =await PhotoCore.deployed();
    auction = await testAuction.deployed();
	await market.getOrder(0).then(function(balance) {
    	console.log( web3.fromWei(balance[1].toNumber(), "ether" ) );
    })
}
