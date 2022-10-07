import { ethers } from "hardhat";
import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ForgeableNFT } from "../../typechain-types";

describe("ForgeableNFT", function () {
	let owner: SignerWithAddress;
	let user: SignerWithAddress;
	let marketplace: SignerWithAddress;
	let erc721: ForgeableNFT;
	const tokenId = 0;

	beforeEach(async function () {
		[owner, user, marketplace] = await ethers.getSigners();
		const erc721Factory = await ethers.getContractFactory("ForgeableNFT");
		erc721 = (await erc721Factory.connect(owner).deploy("")) as ForgeableNFT;
	});

	it("user cannot set marketplace", async function () {
		await expect(erc721.connect(user).setMarketplace(marketplace.address)).to.be.revertedWith(
			"Ownable: caller is not the owner",
		);
	});

	it("user cannot mint NFT directly", async function () {
		await expect(erc721.connect(user).mint(user.address, tokenId)).to.be.revertedWith("Not the marketplace");
	});

	describe("owner sets marketplace", async function () {
		beforeEach(async function () {
			await erc721.connect(owner).setMarketplace(marketplace.address);
		});

		it("initializes as expected", async function () {
			expect(await erc721.marketplace()).to.equal(marketplace.address);
		});

		describe("marketplace mints NFT", async function () {
			beforeEach(async function () {
				await erc721.connect(marketplace).mint(user.address, tokenId);
			});

			it("initializes as expected", async function () {
				expect(await erc721.balanceOf(user.address, tokenId)).to.equal(1);
			});

			it("user cannot burn NFT directly", async function () {
				await expect(erc721.connect(user).burn(user.address, tokenId)).to.be.revertedWith(
					"Not the marketplace",
				);
			});

			it("marketplace can burn NFT", async function () {
				await erc721.connect(marketplace).burn(user.address, tokenId);
				expect(await erc721.balanceOf(user.address, tokenId)).to.equal(0);
			});

			it("gets balance of all tokens", async function () {
				await erc721.connect(marketplace).mint(user.address, 1);
				await erc721.connect(marketplace).mint(user.address, 1);
				await erc721.connect(marketplace).mint(user.address, 2);
				expect(
					(await erc721.balanceOfAllTokens(user.address)).map((x) => x.toNumber()).filter((x) => x > 0),
				).to.eql([1, 2, 1]);
			});
		});
	});
});
