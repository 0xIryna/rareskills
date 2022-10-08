const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("SaleNFT", function () {
	let owner;
	let user;
	let erc721;
	let erc20;
	let marketplace;
	let tokenPerNFT;

	beforeEach(async function () {
		[owner, user] = await ethers.getSigners();
		const erc721Factory = await ethers.getContractFactory("SaleNFT");
		erc721 = await erc721Factory.connect(owner).deploy();

		const erc20Factory = await ethers.getContractFactory("Token");
		erc20 = await erc20Factory.connect(owner).deploy("Test", "TEST");

		const marketplaceFactory = await ethers.getContractFactory("NFTMarketplace");
		marketplace = await marketplaceFactory.connect(owner).deploy(erc20.address, erc721.address);

		tokenPerNFT = await marketplace.TOKEN_PER_NFT();
		await erc20.connect(user).approve(marketplace.address, tokenPerNFT);
	});

	it("user cannot set marketplace", async function () {
		await expect(erc721.connect(user).setMarketplace(marketplace.address)).to.be.revertedWith(
			"Ownable: caller is not the owner",
		);
	});

	it("user cannot mint NFT directly", async function () {
		await expect(erc721.connect(user).mint(user.address)).to.be.revertedWith("Not the marketplace");
	});

	describe("owner sets marketplace", async function () {
		beforeEach(async function () {
			await erc721.connect(owner).setMarketplace(marketplace.address);
		});

		it("initializes as expected", async function () {
			expect(await erc721.marketplace()).to.equal(marketplace.address);
		});

		it("gets token URL", async function () {
			await erc20.connect(owner).transfer(user.address, tokenPerNFT);
			await marketplace.connect(user).mint();
			const tokenURL = await erc721.tokenURI(0);
			expect(tokenURL).to.equal("ipfs://QmePheK3iGURiuzw8qJhcpj1NVWN1cQyZEgF5x6KQF2XZ9/0");
		});

		it("user cannot mint NFT when token balance is insufficient", async function () {
			await expect(marketplace.connect(user).mint()).to.be.revertedWith("Insufficient token balance");
		});

		it("user can mint NFT using marketplace", async function () {
			await erc20.connect(owner).transfer(user.address, tokenPerNFT);
			await marketplace.connect(user).mint();
			expect(await erc721.balanceOf(user.address)).to.equal("1");
		});

		it("user cannot mint NFT when supply is reached", async function () {
			const maxSupply = await erc721.connect(user).MAX_SUPPLY();
			const amount = tokenPerNFT.mul(maxSupply + 1);
			await erc20.connect(owner).transfer(user.address, amount);
			await erc20.connect(user).approve(marketplace.address, amount);

			for (let i = 0; i < maxSupply; i++) {
				await marketplace.connect(user).mint();
			}

			await expect(marketplace.connect(user).mint()).to.be.revertedWith("Max supply reached");
		});
	});
});
