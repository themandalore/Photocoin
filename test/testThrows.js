
//this contract tests the typical workflow from the dApp
var PhotoCore = artifacts.require("PhotoCore");
var Migrations = artifacts.require("Migrations");

async function expectThrow(promise){
  try {
    await promise;
  } catch (error) {
    // TODO: Check jump destination to destinguish between a throw
    //       and an actual invalid jump.
    const invalidOpcode = error.message.search('invalid opcode') >= 0;
    // TODO: When we contract A calls contract B, and B throws, instead
    //       of an 'invalid jump', we get an 'out of gas' error. How do
    //       we distinguish this from an actual out of gas event? (The
    //       testrpc log actually show an 'invalid jump' event.)
    const outOfGas = error.message.search('out of gas') >= 0;
    const revert = error.message.search('revert') >= 0;
    assert(
      invalidOpcode || outOfGas || revert,
      'Expected throw, got \'' + error + '\' instead',
    );
    return;
  }
  assert.fail('Expected throw not received');
};


contract('Contracts', function(accounts) {
  let market;
  let core;

  it('Setup contract for throw testing', async function () {
  	 core =await PhotoCore.new();
     await core.setWhitelist(Migrations.address,true);
	});
  it('Failed Safe Transfer', async function () {
    await core.uploadPhoto(web3.sha3("PrettyFlowers.jpeg"),"Pretty Flowers","David",0,accounts[0])
    await expectThrow(core.safeTransferFrom(accounts[0],Migrations.address,0));
  });

});