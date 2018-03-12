var PhotoMarket = artifacts.require("./PhotoMarket.sol");
var PhotoCore = artifacts.require("./PhotoCore.sol");
var Auction = artifacts.require("./Auction.sol");

contract('Contracts', function(accounts) {
  let market;
  let core;
  let auction;


   beforeEach('setup contract for each test', async function () {
      market = await PhotoMarket.new();
      core =await PhotoCore.new();
      auction = await Auction.new()
   })
	it('Setup contract for testing', async function () {
  	market = await PhotoMarket.deployed();
  	core = await PhotoCore.deployed();
  	auction = await Auction.deployed();
  	await market.setToken(core.address);
  	await core.setMarket(market.address);
  	await core.setAuction(auction.address);
  	assert.equal(await core.marketContract.call(),market.address,"Market contract should be set properly");
	});
	it('Interfaces Supported', async function () {
     	assert(await core.supportsInterface("0x6f909ce0"),true,"ERC721 Interface should be supported");
     	assert(await core.supportsInterface("0x01ffc9a7"),true,"ERC165 Interface should be supported");
   });

	/*it('Upload Photo Test', async function () {
	});
	it('Buy and Sell Photos', async function () {
	});
	it('Auction Photos', async function () {
	});
	it('Transfer Photos', async function () {
	});
	it('Approve and Transfer Photos', async function () {
	});
	it('Unlist Photos', async function () {
	});
	it('Place on Blacklist', async function () {
	});
	it('Test Whitelist', async function () {
	});
	it('Test Fees', async function () {
	});
*/


});

