const { ethers } = require("hardhat");
const { utils } = require("ethers");
const { expect } = require("chai");

describe("TokenSaleERC20", function () {
	let owner;
	let user1;
	let user2;
	let erc20;

	beforeEach(async function () {
		[owner, user1, user2] = await ethers.getSigners();
		const erc20Factory = await ethers.getContractFactory("TokenSaleERC20");
		erc20 = await erc20Factory.connect(owner).deploy("Test", "TEST");
	});

	describe("user1 buys tokens with 300 ETH", async function () {
		beforeEach(async function () {
			await erc20.connect(user1).buy({ value: utils.parseEther("300") });
		});

		it("initializes as expected", async function () {
			expect(await erc20.balanceOf(user1.address)).to.equal(utils.parseEther("300000"));
		});

		it("reverts when zero ETH sent", async function () {
			await expect(erc20.connect(user1).buy()).to.be.revertedWith("Not enough");
		});

		it("reverts when trying to buy more tokens than available", async function () {
			await expect(erc20.connect(user2).buy({ value: utils.parseEther("701") })).to.be.revertedWith("Too much");
		});

		describe("user2 buys tokens with 700 ETH", async function () {
			beforeEach(async function () {
				await erc20.connect(user2).buy({ value: utils.parseEther("700") });
			});

			it("initializes as expected", async function () {
				expect(await erc20.balanceOf(user2.address)).to.equal(utils.parseEther("700000"));
				expect(await erc20.saleActive()).to.equal(false);
			});

			it("reverts when trying to buy after sale is closed", async function () {
				await expect(erc20.connect(user1).buy({ value: utils.parseEther("1") })).to.be.revertedWith("Sale is closed");
			});

			it("owner withdraws ETH from the contract", async function () {
				await expect(() => erc20.connect(owner).withdraw()).to.changeEtherBalance(owner, utils.parseEther("1000"));
			});
		});
	});
});
