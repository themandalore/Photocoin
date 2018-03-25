var HDWalletProvider = require("truffle-hdwallet-provider");
var DefaultBuilder = require("truffle-default-builder");

var mnemonic = "document";

module.exports = {
   /*build: new DefaultBuilder({
    "index.html": "index.html",
    "main.js": [
      "main.js"
    ],
    "app.css": [
      "app.css"
    ]
  }),*/
  solc: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  },
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*", // Match any network id
      gasPrice: 1 // Specified in Wei
    },
    ropsten: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "https://ropsten.infura.io/HFP6nfe8YSNUiqIf9xbj")
      },
      gas: 4600000,
      gasPrice: 50000000000,
      network_id: 3
    }
  }
};

