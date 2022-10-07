import "@typechain/hardhat";
import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "solidity-coverage";

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
const config: HardhatUserConfig = {
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

export default config;
