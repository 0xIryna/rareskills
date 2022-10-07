import { ethers } from "hardhat";
import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ForgeableNFT, NFTForgerMarketplace } from "../../typechain-types";

describe("NFTForgerMarketplace", function () {
	let owner: SignerWithAddress;
	let user: SignerWithAddress;
	let nft: ForgeableNFT;
	let marketplace: NFTForgerMarketplace;

	beforeEach(async function () {
		[owner, user] = await ethers.getSigners();
		const nftFactory = await ethers.getContractFactory("ForgeableNFT");
		nft = await nftFactory.connect(owner).deploy("");
		const marketplaceFactory = await ethers.getContractFactory("NFTForgerMarketplace");
		marketplace = await marketplaceFactory.connect(owner).deploy(nft.address);
		nft.connect(owner).setMarketplace(marketplace.address);
	});

	describe("user mints token 0", async function () {
		beforeEach(async function () {
			await marketplace.connect(user).mint(0);
		});

		it("initializes as expected", async function () {
			expect(await nft.balanceOf(user.address, 0)).to.equal(1);
		});

		describe("user mints token 1", async function () {
			beforeEach(async function () {
				const delay = await marketplace.COOLDOWN();
				await ethers.provider.send("evm_increaseTime", [delay.toNumber()]);
				await ethers.provider.send("evm_mine", []);
				await marketplace.connect(user).mint(1);
			});

			it("initializes as expected", async function () {
				expect(await nft.balanceOf(user.address, 1)).to.equal(1);
			});

			describe("user mints token 2", async function () {
				beforeEach(async function () {
					const delay = await marketplace.COOLDOWN();
					await ethers.provider.send("evm_increaseTime", [delay.toNumber()]);
					await ethers.provider.send("evm_mine", []);
					await marketplace.connect(user).mint(2);
				});

				it("initializes as expected", async function () {
					expect(await nft.balanceOf(user.address, 2)).to.equal(1);
				});

				it("it forges token 0 and 1 to token 3", async function () {
					await marketplace.connect(user).forge([0, 1]);
					expect(await nft.balanceOf(user.address, 0)).to.equal(0);
					expect(await nft.balanceOf(user.address, 1)).to.equal(0);
					expect(await nft.balanceOf(user.address, 3)).to.equal(1);
				});

				it("it forges token 1 and 2 to token 4", async function () {
					await marketplace.connect(user).forge([1, 2]);
					expect(await nft.balanceOf(user.address, 1)).to.equal(0);
					expect(await nft.balanceOf(user.address, 2)).to.equal(0);
					expect(await nft.balanceOf(user.address, 4)).to.equal(1);
				});

				it("it forges token 0 and 2 to token 5", async function () {
					await marketplace.connect(user).forge([0, 2]);
					expect(await nft.balanceOf(user.address, 0)).to.equal(0);
					expect(await nft.balanceOf(user.address, 2)).to.equal(0);
					expect(await nft.balanceOf(user.address, 5)).to.equal(1);
				});

				it("it forges token 0, 1 and 2 to token 6", async function () {
					await marketplace.connect(user).forge([0, 1, 2]);
					expect(await nft.balanceOf(user.address, 0)).to.equal(0);
					expect(await nft.balanceOf(user.address, 1)).to.equal(0);
					expect(await nft.balanceOf(user.address, 2)).to.equal(0);
					expect(await nft.balanceOf(user.address, 6)).to.equal(1);
				});

				it("reverts when wrong number of tokens supplied for forging", async function () {
					await expect(marketplace.connect(user).forge([0])).to.be.revertedWith("Incorrect number of tokens");
				});

				it("reverts when tokens supplied in the wrong order", async function () {
					await expect(marketplace.connect(user).forge([1, 0])).to.be.revertedWith(
						"Tokens or their order are incorrect",
					);
				});

				it("reverts when trading same tokens", async function () {
					await expect(marketplace.connect(user).trade(0, 0)).to.be.revertedWith(
						"Token Ids must be different",
					);
				});

				it("reverts when trading wrong token", async function () {
					await expect(marketplace.connect(user).trade(0, 3)).to.be.revertedWith("Token out must be 0-2");
				});

				it("reverts when balance of tokenIn is insufficient", async function () {
					await expect(marketplace.connect(owner).trade(1, 0)).to.be.revertedWith("Insufficient balance");
				});

				it("it trades token 0 for token 2", async function () {
					await marketplace.connect(user).trade(0, 2);
					expect(await nft.balanceOf(user.address, 0)).to.equal(0);
					expect(await nft.balanceOf(user.address, 2)).to.equal(2);
				});

				it("reverts when burning invalid token", async function () {
					await expect(marketplace.connect(owner).burn(0)).to.be.reverted;
				});

				it("it burns token 3", async function () {
					await marketplace.connect(user).forge([0, 1]);
					expect(await nft.balanceOf(user.address, 3)).to.equal(1);

					await marketplace.connect(user).burn(3);
					expect(await nft.balanceOf(user.address, 3)).to.equal(0);
				});
			});
		});
	});
});
