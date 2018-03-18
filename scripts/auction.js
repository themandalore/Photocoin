var PhotoMarket = artifacts.require("PhotoMarket");
var PhotoCore = artifacts.require("PhotoCore");
var testAuction = artifacts.require("testAuction");

var account0 = "0x79b4b3c09897e05027cdecd9cbddcb2cd5492638";
module.exports =async function(accounts) {
	market = await PhotoMarket.deployed();
    core =await PhotoCore.deployed();
    auction = await testAuction.deployed();
	await core.uploadPhoto(web3.sha3("PrettyFlowers.jpeg"),"Pretty Flowers","David",100,account0);
	await core.uploadPhoto(web3.sha3("Prettygirls.jpeg"),"Pretty girls","Nick",101,account0);
	await core.uploadPhoto(web3.sha3("MonaLisa.jpeg"),"Mona Lisa","Leo",102,account0);
	await core.uploadPhoto(web3.sha3("CafeTerraceatNight.jpeg"),"Cafe Terrace at Night","Vince",103,account0);
	await core.uploadPhoto(web3.sha3("Doge.jpeg"),"Doge","Anon",104,account0);
	await core.uploadPhoto(web3.sha3("Vitalik.jpeg"),"Vitalik","David",105,account0);
	await core.uploadPhoto(web3.sha3("Mer_de_noms.jpeg"),"Mer de Noms","APC",106,account0);
	await core.uploadPhoto(web3.sha3("YourWilderness.jpeg"),"YourWilderness","PineappleThief",107,account0);
	await core.uploadPhoto(web3.sha3("Themata.jpeg"),"Themata","Karnivool",108,account0);
	await core.uploadPhoto(web3.sha3("Andromeda.jpeg"),"Andromeda","Sithu Aye",109,account0);
	Tokens = await core.tokensOf(account0);
	for(var i=0;i<Tokens.length;i++){
		await auction.setAuction(86400*14,Tokens[i]);
		console.log(Tokens[i],' now up for auction');
	}
}
