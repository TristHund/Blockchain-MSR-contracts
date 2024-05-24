require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  sepolia: {
    url: SEPOLIA_RPC_URL !== undefined ? SEPOLIA_RPC_URL : "",
    accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
    //   accounts: {
    //     mnemonic: MNEMONIC,
    //   },
    chainId: 11155111,
  },
  networks: {
    hardhat: {
        chainId: 31337,
    },
    localhost: {
        chainId: 31337,
    }
  },
  defaultNetwork: "hardhat",
};
