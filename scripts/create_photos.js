var PhotoMarket = artifacts.require("PhotoMarket");
var PhotoCore = artifacts.require("PhotoCore");
var testAuction = artifacts.require("testAuction");


var myAddress1 = "0x0d7EFfEFdB084DfEB1621348c8C70cc4e871Eba4";
var myAddress2 = "0x92683a09b64148369b09f96350b6323d37af6ae3";
var account0 = "0x79b4b3c09897e05027cdecd9cbddcb2cd5492638";
module.exports =async function(accounts) {
	market = await PhotoMarket.deployed();
    core =await PhotoCore.deployed();
    auction = await testAuction.deployed();
	await market.setToken(core.address);
	await core.setMarket(market.address);
	await core.setAuction(auction.address);
	await auction.setToken(core.address);
	await core.setAllowUploads();
	await core.setWhitelist(market.address,true);
	await core.setWhitelist(auction.address,true);
	await core.setWhitelist(myAddress1,true);
	await core.setWhitelist(myAddress2,true);
	await core.uploadPhoto(web3.sha3("PrettyFlowers.jpeg"),"Pretty Flowers","David",0,myAddress1);
	await core.uploadPhoto(web3.sha3("Prettygirls.jpeg"),"Pretty girls","Nick",1,myAddress1);
	await core.uploadPhoto(web3.sha3("MonaLisa.jpeg"),"Mona Lisa","Leo",2,myAddress1);
  	console.log(myAddress1);
  	//await web3.eth.sendTransaction({from:account0,to:myAddress1, value:web3.toWei(10, "ether")});
  	//await web3.eth.sendTransaction({from:account0, to:myAddress2, value:web3.toWei(10, "ether")});
}
