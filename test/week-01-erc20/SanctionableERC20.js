const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("SanctionableERC20", function () {
	let owner;
	let user;
	let centralizedAuthority;
	let erc20;

	beforeEach(async function () {
		[owner, user, centralizedAuthority] = await ethers.getSigners();
		const erc20Factory = await ethers.getContractFactory("SanctionableERC20");
		erc20 = await erc20Factory.connect(owner).deploy("Test", "TEST", centralizedAuthority.address);

		erc20.connect(owner).transfer(user.address, "1000");
	});

	describe("user is sanctioned", async function () {
		beforeEach(async function () {
			await erc20.connect(centralizedAuthority).updateSanctioned(user.address, true);
		});

		it("initializes as expected", async function () {
			expect(await erc20.sanctioned(user.address)).to.be.true;
		});

		it("user1 cannot transfer tokens", async function () {
			await expect(erc20.connect(user).transfer(owner.address, "1000")).to.be.revertedWith("Sanctioned");
		});

		it("user cannot sunction", async function () {
			await expect(erc20.connect(user).updateSanctioned(owner.address, true)).to.be.revertedWith(
				"Not a centralized authority",
			);
		});

		describe("user is unsanctioned", async function () {
			beforeEach(async function () {
				await erc20.connect(centralizedAuthority).updateSanctioned(user.address, false);
			});

			it("initializes as expected", async function () {
				expect(await erc20.sanctioned(user.address)).to.be.false;
			});

			it("user1 can transfer tokens", async function () {
				await expect(erc20.connect(user).transfer(owner.address, "1000")).not.to.be.reverted;
			});
		});
	});
});
