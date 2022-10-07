import { ethers } from "hardhat";
import { expect } from "chai";
import { utils } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { RefundableERC20 } from "../../typechain-types";

describe("RefundableERC20", function () {
	let owner: SignerWithAddress;
	let user: SignerWithAddress;
	let erc20: RefundableERC20;

	beforeEach(async function () {
		[owner, user] = await ethers.getSigners();
		const erc20Factory = await ethers.getContractFactory("RefundableERC20");
		erc20 = (await erc20Factory.connect(owner).deploy("Test", "TEST")) as RefundableERC20;
	});

	it("user cannot buy without providing ETH", async function () {
		await expect(erc20.connect(user).buy()).to.be.revertedWith("Not enough");
	});

	it("user cannot buy when not enough tokens available", async function () {
		await ethers.provider.send("hardhat_setBalance", [owner.address, utils.parseEther("1000").toHexString()]);
		await erc20.connect(owner).buy({ value: utils.parseEther("999") });
		await expect(erc20.connect(user).buy({ value: utils.parseEther("2") })).to.be.revertedWith(
			"Not enough tokens available",
		);
	});

	describe("user buys tokens with 100 wei", async function () {
		beforeEach(async function () {
			await erc20.connect(user).buy({ value: "100" });
		});

		it("initializes as expected", async function () {
			expect(await erc20.balanceOf(user.address)).to.equal("100000");
		});

		it("user cannot sell 0 tokens", async function () {
			await expect(erc20.connect(user).sellBack("0")).to.be.revertedWith("Not enough");
		});

		it("user sells tokens", async function () {
			await expect(() => erc20.connect(user).sellBack("100000")).to.changeEtherBalance(user, "50");
			expect(await erc20.balanceOf(user.address)).to.equal(0);
		});

		it("user cannot sell if not enough ETH available", async function () {
			await erc20.connect(owner).withdraw();
			await expect(erc20.connect(user).sellBack("100000")).to.be.revertedWith("Not enough ETH available");
		});
	});
});
