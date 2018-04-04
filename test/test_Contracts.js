var PhotoMarket = artifacts.require("PhotoMarket");
var PhotoCore = artifacts.require("PhotoCore");
var testAuction = artifacts.require("testAuction");

contract('Contracts', function(accounts) {
  let market;
  let core;
  let auction;


   beforeEach('Setup contract for each test', async function () {
      market = await PhotoMarket.new();
      core =await PhotoCore.new();
      auction = await testAuction.new();
        await market.setToken(core.address);
  		await core.setMarket(market.address);
  		await core.setAuction(auction.address);
  		await auction.setToken(core.address);
      await core.setWhitelist(market.address,true);
      await core.setWhitelist(auction.address,true);
      for(i=1;i<8;i++){
			await core.setWhitelist(accounts[i],true);
		}
   })
	it('Setup contract for testing', async function () {
  	assert.equal(await core.marketContract.call(),market.address,"Market contract should be set properly");
	});
	it('Interfaces Supported', async function () {
     	assert(await core.supportsInterface("0x6f909ce0"),true,"ERC721 Interface should be supported");
     	assert(await core.supportsInterface("0x01ffc9a7"),true,"ERC165 Interface should be supported");
   });
	it('Upload Photo Test', async function () {
  		await core.uploadPhoto(web3.sha3("PrettyFlowers.jpeg"),"Pretty Flowers","David",0,accounts[0]);
  		await core.uploadPhoto(web3.sha3("Prettygirls.jpeg"),"Pretty girls","Nick",1,accounts[1]);
  		await core.uploadPhoto(web3.sha3("MonaLisa.jpeg"),"Mona Lisa","Leo",2,accounts[2]);
  		await core.uploadPhoto(web3.sha3("CafeTerraceatNight.jpeg"),"Cafe Terrace at Night","Vince",3,accounts[3]);
  		await core.uploadPhoto(web3.sha3("Doge.jpeg"),"Doge","Anon",4,accounts[4]);
  		await core.uploadPhoto(web3.sha3("MoreFlowers.jpeg"),"More Flowers","David",5,accounts[0]);
  		Tokens = await core.tokensOf(accounts[0]);
	  	assert.equal(Tokens.length,2,"Owner should have 2 photos");
	  	assert.equal(await core.balanceOf(accounts[1]),1,"Account 1 should have 1 photo");
	  	Tokens = await core.tokensOf(accounts[2]);
	  	Details = await core.getPhoto(Tokens[0]);
	  	assert.equal(Details[1],"Leo","Photo 2 should be taken by Leo");
	  	assert.equal(await core.ownerOf(3),accounts[3],"Account3 should own this token");
	  	assert.equal(await core.totalTokens.call(),6,"There should be 6 photos");
		
	});
	it('Buy and Sell Photos', async function () {
		await core.uploadPhoto(web3.sha3("PrettyFlowers.jpeg"),"Pretty Flowers","David",0,accounts[0]);
  		await market.listPhoto(0,web3.toWei(5, 'ether'));
	  	assert.equal(await core.ownerOf(0),market.address,"market should own listed product");
	  	var balance= eval(await (web3.fromWei(web3.eth.getBalance(accounts[0]), 'ether').toFixed(0)));
	  	await market.buyPhoto(0,{value: web3.toWei(5,'ether'), from: accounts[2]});
	  	assert.equal(await core.ownerOf(0),accounts[2],"Account 2 should own listed product");
	  	Tokens = await core.tokensOf(accounts[0]);
	  	assert.equal(Tokens.length,0,"Owner should only have 0 pets");
	  	Order = await market.getOrder(0);
	  	assert.equal(Order[1],0,"Order should be erased");
	  	var balance2 = eval(await (web3.fromWei(web3.eth.getBalance(accounts[0]), 'ether').toFixed(0)));
	  	assert(balance == balance2 - 5, "Account 0 should be sent 5 ether");
	});
	it('Auction Photo', async function () {
		await core.uploadPhoto(web3.sha3("PrettyFlowers.jpeg"),"Pretty Flowers","David",0,accounts[0]);
  		await auction.setAuction(100,0);
  		assert.equal(await core.ownerOf(0),auction.address,"market should own listed product");
	  	var balance= eval(await (web3.fromWei(web3.eth.getBalance(accounts[0]), 'ether').toFixed(0)));
	  	var balance2= eval(await (web3.fromWei(web3.eth.getBalance(accounts[2]), 'ether').toFixed(0)));
	  	await auction.bid(0,{value: web3.toWei(4,'ether'), from: accounts[2]});
	  	await auction.bid(0,{value: web3.toWei(5,'ether'), from: accounts[3]});
	  	var balance2_2= eval(await (web3.fromWei(web3.eth.getBalance(accounts[2]), 'ether').toFixed(0)));
	  	assert(balance2 == balance2_2 + 4, "Account 2 should be have money held by auction contract");
	  	await auction.withdraw({from: accounts[2]});
	  	var balance2_2= eval(await (web3.fromWei(web3.eth.getBalance(accounts[2]), 'ether').toFixed(0)));
	  	assert(balance2 == balance2_2, "Account 2 should have no change in ether");
	  	assert.equal(await auction.getHighestBidder(0),accounts[3],"Account 3 should be highest bidder");
	  	assert.equal(await auction.getHighestBid(0),web3.toWei(5,'ether'),"The highest bid should be 5 eth");
	  	await auction.endAuction(0);
	  	assert.equal(await auction.auctionIndex.call(0),0,"The auction should be ended");
	  	await auction.withdraw();
	  	assert.equal(await core.ownerOf(0),accounts[3],"Account3 should own this token");
	  	var balance_2= eval(await(web3.fromWei(web3.eth.getBalance(accounts[0]), 'ether').toFixed(0)));
		assert(balance == balance_2 - 5, "Account 0 should get the highest Bid amount");
	});
	it('Transfer Photos', async function () {
		await core.uploadPhoto(web3.sha3("Prettygirls.jpeg"),"Pretty girls","Nick",0,accounts[1]);
		await core.transferFrom(accounts[1],accounts[3],0,{from: accounts[1]});
		assert.equal(await core.ownerOf(0),accounts[3],"Account 3 should own product");
  
	});
	it('Approve and Transfer Photos', async function () {
  		await core.uploadPhoto(web3.sha3("CafeTerraceatNight.jpeg"),"Cafe Terrace at Night","Vince",0,accounts[3]);
  		await core.uploadPhoto(web3.sha3("Doge.jpeg"),"Doge","Anon",1,accounts[4]);
		await core.setApprovalForAll(accounts[2],true,{from: accounts[3]});
		await core.transferFrom(accounts[3],accounts[5],0,{from: accounts[2]});
		assert.equal(await core.ownerOf(0),accounts[5],"Account 5 should own transferred product");
		await core.approve(accounts[2],1,{from: accounts[4]});
		await core.transferFrom(accounts[4],accounts[6],1,{from: accounts[2]});
		assert.equal(await core.ownerOf(1),accounts[6],"Account 6 should own transferred product");
	});
	it('Unlist Photos', async function () {
		await core.uploadPhoto(web3.sha3("Doge.jpeg"),"Doge","Anon",0,accounts[4]);
		await market.listPhoto(0,web3.toWei(7, 'ether'),{from: accounts[4]});
	   	Order = await market.getOrder(0);
	  	assert.equal(Order[1],web3.toWei(7, 'ether'),"Order should be placed");
	  	await market.unlistPhoto(0,{from: accounts[4]});
	   	Order = await market.getOrder(0);
	  	assert.equal(Order[1],0,"Order should be erased");
   
	});
	it('Place on Blacklist', async function () {
	    await market.blacklistParty(accounts[1],true);
   		 assert(await market.isBlacklist(accounts[1]),true,"Party should be blacklisted");
	});
	
	it('Test Fees', async function () {
		await market.setFee(100);
		await core.uploadPhoto(web3.sha3("Doge.jpeg"),"Doge","Anon",0,accounts[4]);
		await market.listPhoto(0,web3.toWei(10, 'ether'),{from:accounts[4]});
	  	assert.equal(await core.ownerOf(0),market.address,"market should own listed product");
	  	var balance= eval(await (web3.fromWei(web3.eth.getBalance(accounts[0]), 'ether').toFixed(0)));
	  	var balance2= eval(await (web3.fromWei(web3.eth.getBalance(accounts[4]), 'ether').toFixed(0)));
	  	await market.buyPhoto(0,{value: web3.toWei(10,'ether'), from: accounts[5]});
	  	assert.equal(await core.ownerOf(0),accounts[5],"Account 2 should own listed product");
	  	Order = await market.getOrder(0);
	  	assert.equal(Order[1],0,"Order should be erased");
	  	await market.withdraw();
	  	var balance_2 = eval(await (web3.fromWei(web3.eth.getBalance(accounts[0]), 'ether').toFixed(0)));
	  	var balance2_2= eval(await (web3.fromWei(web3.eth.getBalance(accounts[4]), 'ether').toFixed(0)));
	  	assert(balance == balance_2 - 1, "Account 0 should be sent 1 ether");
	  	assert(balance2 == balance2_2 - 9, "Account 4 should be sent 9 ether");
	});
	it('Lease Photos', async function () {
		await core.uploadPhoto(web3.sha3("PrettyFlowers.jpeg"),"Pretty Flowers","David",0,accounts[0]);
  		await market.listLease(0,web3.toWei(1, 'ether'));
	  	var balance= eval(await (web3.fromWei(web3.eth.getBalance(accounts[0]), 'ether').toFixed(0)));
	  	await market.buyLease(0,{value: web3.toWei(1,'ether'), from: accounts[2]});
	  	await market.buyLease(0,{value: web3.toWei(1,'ether'), from: accounts[3]});
	  	Order = await market.getLeases(0);
	  	assert.equal(Order[1],web3.toWei(1, 'ether'),"Lease order should still be on book");
	  	Leases = await market.getLeasebyOwner(accounts[2]);
	  	assert.equal(Leases[0],0,"Account2 should have a lease on token 0");
	  	total = await market.getTokenLeases(0);
	  	assert.equal(total[0],accounts[2],"There should be first address is listed in who leased the token.")
	  	assert.equal(total[1],accounts[3],"The second address is listed in who leased the token.")
	  	var balance2 = eval(await (web3.fromWei(web3.eth.getBalance(accounts[0]), 'ether').toFixed(0)));
	  	assert(balance == balance2 - 2, "Account 0 should be sent 5 ether");
	});
	it('UnLease Photos', async function () {
		await core.setAllowUploads();
		await core.uploadPhoto(web3.sha3("Doge.jpeg"),"Doge","Anon",0,accounts[4],{from:accounts[4]});
		await market.listLease(0,web3.toWei(1, 'ether'),{from:accounts[4]});
		Order = await market.getLeases(0);
		assert.equal(Order[1],web3.toWei(1, 'ether'),"Lease order should still be on book");
		await market.unlistLease(0,{from:accounts[4]});
		Order = await market.getLeases(0);
		assert.equal(Order[1],0,"Lease order should not still be on book");
	});
		it('Allow uploads of Photos', async function () {
		console.log(await core.allowUploads.call());
		await core.setAllowUploads();
		console.log(await core.allowUploads.call());
		assert.equal(await core.allowUploads.call(),true,"everyone should be allowed to upload")
		await core.uploadPhoto(web3.sha3("Doge.jpeg"),"Doge","Anon",0,accounts[4],{from:accounts[4]});
	});

	it('Safe Transfer', async function () {
	    await core.uploadPhoto(web3.sha3("PrettyFlowers.jpeg"),"Pretty Flowers","David",0,accounts[0]);
	    await core.uploadPhoto(web3.sha3("PrettyFlowers.jpeg"),"Pretty Flowers","David",1,accounts[0]);;
	    var user0Tokens = await core.tokensOf(accounts[0]);
	    core.safeTransferFrom(accounts[0],market.address,user0Tokens[0]);
	    core.safeTransferFrom(accounts[0],accounts[1],user0Tokens[1]);
	    assert.equal(await core.ownerOf(user0Tokens[0]),market.address,"Market should own listed product");
	    assert.equal(await core.ownerOf(user0Tokens[1]),accounts[1],"Account 1 should own listed product");
   });

});

