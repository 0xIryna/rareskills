import { ethers } from "hardhat";
import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { RefundableERC20 } from "../../typechain-types";

describe("RefundableERC20", function () {
	let owner: SignerWithAddress;
	let user1: SignerWithAddress;
	let user2: SignerWithAddress;
	let erc20: RefundableERC20;

	beforeEach(async function () {
		[owner, user1, user2] = await ethers.getSigners();
		const erc20Factory = await ethers.getContractFactory("RefundableERC20");
		erc20 = (await erc20Factory.connect(owner).deploy("Test", "TEST")) as RefundableERC20;
	});

	describe("user1 buys tokens with 100 ETH", async function () {
		beforeEach(async function () {
			await erc20.connect(user1).buy({ value: "100" });
		});

		it("initializes as expected", async function () {
			expect(await erc20.balanceOf(user1.address)).to.equal("100000");
		});

		it("user1 sells tokens", async function () {
			await expect(() => erc20.connect(user1).sellBack("100000")).to.changeEtherBalance(user1, "50");
			expect(await erc20.balanceOf(user1.address)).to.equal(0);
		});

		it("user1 cannot sell if not enough ETH available", async function () {
			await erc20.connect(owner).withdraw();
			await expect(erc20.connect(user1).sellBack("100000")).to.be.revertedWith("Not enough ETH available");
		});
	});
});
