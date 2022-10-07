import { ethers } from "hardhat";
import { utils } from "ethers";
import { constants } from "ethers";
import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { SaleNFT, Token, NFTMarketplace } from "../../typechain-types";

describe("NFTMarketplace", function () {
	let owner: SignerWithAddress;
	let user: SignerWithAddress;
	let erc721: SaleNFT;
	let erc20: Token;
	let marketplace: NFTMarketplace;

	beforeEach(async function () {
		[owner, user] = await ethers.getSigners();
		const erc721Factory = await ethers.getContractFactory("SaleNFT");
		erc721 = (await erc721Factory.connect(owner).deploy()) as SaleNFT;

		const erc20Factory = await ethers.getContractFactory("Token");
		erc20 = (await erc20Factory.connect(owner).deploy("Test", "TEST")) as Token;

		const marketplaceFactory = await ethers.getContractFactory("NFTMarketplace");
		marketplace = (await marketplaceFactory.connect(owner).deploy(erc20.address, erc721.address)) as NFTMarketplace;

		await erc721.connect(owner).setMarketplace(marketplace.address);
		await erc20.connect(user).approve(marketplace.address, utils.parseEther("10"));
	});

	it("reverts when zero address is passed to marketplace instead of erc20", async function () {
		const marketplaceFactory = await ethers.getContractFactory("NFTMarketplace");
		await expect(
			marketplaceFactory.connect(owner).deploy(constants.AddressZero, erc721.address),
		).to.be.revertedWith("Invalid address");
	});

	it("reverts when zero address is passed to marketplace instead of erc721", async function () {
		const marketplaceFactory = await ethers.getContractFactory("NFTMarketplace");
		await expect(marketplaceFactory.connect(owner).deploy(erc20.address, constants.AddressZero)).to.be.revertedWith(
			"Invalid address",
		);
	});

	it("user can mint NFT", async function () {
		await erc20.connect(owner).transfer(user.address, utils.parseEther("10"));
		await marketplace.connect(user).mint();
		expect(await erc721.balanceOf(user.address)).to.equal("1");
		expect(await erc20.balanceOf(marketplace.address)).to.equal(utils.parseEther("10"));
	});

	it("user cannot mint NFT when token balance is insufficient", async function () {
		await expect(marketplace.connect(user).mint()).to.be.revertedWith("Insufficient token balance");
	});

	it("user cannot withdraw tokens", async function () {
		await expect(marketplace.connect(user).withdrawTokens()).to.be.revertedWith("Ownable: caller is not the owner");
	});

	it("owner can withdraw tokens", async function () {
		await erc20.connect(owner).transfer(user.address, utils.parseEther("10"));
		await marketplace.connect(user).mint();

		await expect(() => marketplace.connect(owner).withdrawTokens()).to.changeTokenBalance(
			erc20,
			owner,
			utils.parseEther("10"),
		);
	});
});
