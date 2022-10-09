require("@typechain/hardhat");
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-waffle");
require("solidity-coverage");

/**
 * @type import('hardhat/config').HardhatUserConfig
 */

module.exports = {
	solidity: "0.8.17",
	paths: {
		sources: "./contracts/",
	},
	networks: {
		hardhat: {
			accounts: {
				accountsBalance: "100000000000000000000000",
			},
			allowUnlimitedContractSize: true,
			chainId: 1,
		},
	},
};
