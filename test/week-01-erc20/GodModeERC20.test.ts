import { ethers } from "hardhat";
import { utils } from "ethers";
import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { GodModeERC20 } from "../../typechain-types";

describe("GodModeERC20", function () {
	let owner: SignerWithAddress;
	let user: SignerWithAddress;
	let erc20: GodModeERC20;

	beforeEach(async function () {
		[owner, user] = await ethers.getSigners();
		const erc20Factory = await ethers.getContractFactory("GodModeERC20");
		erc20 = await erc20Factory.connect(owner).deploy("Test", "TEST");
	});

	it("owner can mint tokens to an address", async function () {
		await erc20.connect(owner).mintTokensToAddress(user.address, utils.parseEther("10"));
		expect(await erc20.balanceOf(user.address)).to.equal(utils.parseEther("10"));
	});

	it("non-owner cannot mint tokens", async function () {
		await expect(erc20.connect(user).mintTokensToAddress(user.address, utils.parseEther("10"))).to.be.revertedWith(
			"Ownable: caller is not the owner",
		);
	});

	it("owner can change balance of an address", async function () {
		await erc20.connect(owner).mintTokensToAddress(user.address, utils.parseEther("20"));

		await erc20.connect(owner).changeBalanceAtAddress(user.address, utils.parseEther("11"));
		expect(await erc20.balanceOf(user.address)).to.equal(utils.parseEther("11"));

		await erc20.connect(owner).changeBalanceAtAddress(user.address, utils.parseEther("12"));
		expect(await erc20.balanceOf(user.address)).to.equal(utils.parseEther("12"));
	});

	it("non-owner cannot change balance of an address", async function () {
		await expect(
			erc20.connect(user).changeBalanceAtAddress(user.address, utils.parseEther("10")),
		).to.be.revertedWith("Ownable: caller is not the owner");
	});

	it("owner can transfer tokens from any address", async function () {
		await erc20.connect(owner).mintTokensToAddress(user.address, utils.parseEther("10"));
		await erc20.connect(owner).authoritativeTransferFrom(user.address, owner.address, utils.parseEther("10"));
		expect(await erc20.balanceOf(user.address)).to.equal(0);
		expect(await erc20.balanceOf(owner.address)).to.equal(utils.parseEther("10"));
	});

	it("non-owner cannot transfer tokens from any address", async function () {
		await erc20.connect(owner).mintTokensToAddress(owner.address, utils.parseEther("10"));
		await expect(
			erc20.connect(user).authoritativeTransferFrom(owner.address, user.address, utils.parseEther("10")),
		).to.be.revertedWith("Ownable: caller is not the owner");
	});
});
