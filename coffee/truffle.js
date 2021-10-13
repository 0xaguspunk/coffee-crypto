const HDWalletProvider = require('truffle-hdwallet-provider');
require('dotenv').config();

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 9545,
      network_id: "*" // Match any network id
    },
    rinkeby: {
      provider: () => new HDWalletProvider(process.env.MNEMONIC, process.env.INFURA_URL),
      network_id: 4,
    },
  },
  compilers: {
    solc: {
      version: "0.8.0",
    },
  }
};
