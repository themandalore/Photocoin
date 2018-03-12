var HDWalletProvider = require("truffle-hdwallet-provider");
var DefaultBuilder = require("truffle-default-builder");

var mnemonic = "other tray hint valid buyer fiscal patch fly damp ocean produce wish";

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
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*", // Match any network id
      gasPrice: 1 // Specified in Wei
    },
    ropsten: {
      provider: new HDWalletProvider(mnemonic, "https://ropsten.infura.io"),
      network_id: 3,
      gas: 4612388,
      gasPrice: 50000000000 // Specified in Wei
    }
  }
};

