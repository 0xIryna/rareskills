import { ethers } from "hardhat";
import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { FreeNFT } from "../../typechain-types";

describe("FreeNFT", function () {
	let owner: SignerWithAddress;
	let user: SignerWithAddress;
	let erc721: FreeNFT;

	beforeEach(async function () {
		[owner, user] = await ethers.getSigners();
		const erc721Factory = await ethers.getContractFactory("FreeNFT");
		erc721 = (await erc721Factory.connect(owner).deploy()) as FreeNFT;
	});

	it("gets token URL", async function () {
		await erc721.connect(user).mint();
		const tokenURL = await erc721.tokenURI(0);
		expect(tokenURL).to.equal("ipfs://QmePheK3iGURiuzw8qJhcpj1NVWN1cQyZEgF5x6KQF2XZ9/0");
	});

	it("user can mint NFT", async function () {
		await erc721.connect(user).mint();
		expect(await erc721.balanceOf(user.address)).to.equal("1");
	});

	it("user cannot mint NFT when supply is reached", async function () {
		const maxSupply = await erc721.connect(user).MAX_SUPPLY();

		for (let i = 0; i < maxSupply; i++) {
			await erc721.connect(user).mint();
		}

		await expect(erc721.connect(user).mint()).to.be.revertedWith("Max supply reached");
	});
});
