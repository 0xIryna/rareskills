import { ethers } from "hardhat";
import { utils } from "ethers";
import { constants } from "ethers";
import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { SaleNFT, Token, NFTMarketplace, NFTStaking } from "../../typechain-types";

describe("NFTMarketplace", function () {
	let owner: SignerWithAddress;
	let user: SignerWithAddress;
	let erc721: SaleNFT;
	let erc20: Token;
	let marketplace: NFTMarketplace;
	let staking: NFTStaking;
	const tokenId = 0;

	beforeEach(async function () {
		[owner, user] = await ethers.getSigners();
		const erc721Factory = await ethers.getContractFactory("SaleNFT");
		erc721 = (await erc721Factory.connect(owner).deploy()) as SaleNFT;

		const erc20Factory = await ethers.getContractFactory("Token");
		erc20 = (await erc20Factory.connect(owner).deploy("Test", "TEST")) as Token;

		const marketplaceFactory = await ethers.getContractFactory("NFTMarketplace");
		marketplace = (await marketplaceFactory.connect(owner).deploy(erc20.address, erc721.address)) as NFTMarketplace;

		const stakingFactory = await ethers.getContractFactory("NFTStaking");
		staking = (await stakingFactory.connect(owner).deploy(erc20.address, erc721.address)) as NFTStaking;

		await erc721.connect(owner).setMarketplace(marketplace.address);

		await erc20.connect(owner).transfer(user.address, utils.parseEther("10"));
		await erc20.connect(user).approve(marketplace.address, utils.parseEther("10"));
		await marketplace.connect(user).mint();
	});

	it("reverts when zero address is passed to staking instead of erc20", async function () {
		const stakingFactory = await ethers.getContractFactory("NFTStaking");
		await expect(stakingFactory.connect(owner).deploy(constants.AddressZero, erc721.address)).to.be.revertedWith(
			"Invalid address",
		);
	});

	it("reverts when zero address is passed to staking instead of erc721", async function () {
		const stakingFactory = await ethers.getContractFactory("NFTStaking");
		await expect(stakingFactory.connect(owner).deploy(erc20.address, constants.AddressZero)).to.be.revertedWith(
			"Invalid address",
		);
	});

	describe("user stakes NFT", async function () {
		beforeEach(async function () {
			await erc721.connect(user).approve(staking.address, tokenId);
			await staking.connect(user).stake(tokenId);
		});

		it("initializes as expected", async function () {
			expect(await erc721.balanceOf(staking.address)).to.equal(1);
			expect(await erc721.balanceOf(user.address)).to.equal(0);
			expect(await staking.staked(tokenId)).to.equal(user.address);
			expect((await staking.lastRewardWithdrawal(tokenId)).toNumber()).to.be.greaterThan(0);
		});

		it("not an NFT owner cannot withdraw reward", async function () {
			await expect(staking.connect(owner).withdrawReward(tokenId)).to.be.revertedWith("Not an NFT owner");
		});

		it("not an NFT owner cannot withdraw NFT", async function () {
			await expect(staking.connect(owner).withdrawNFT(tokenId)).to.be.revertedWith("Not an NFT owner");
		});

		it("user cannot withdraw rewards if the interval has not passed", async function () {
			await expect(staking.connect(user).withdrawReward(tokenId)).to.be.revertedWith("Try later");
		});

		it("user cannot withdraw rewards when rewards token balance is insufficient", async function () {
			const delay = await staking.INTERVAL();
			await ethers.provider.send("evm_increaseTime", [delay.toNumber()]);
			await ethers.provider.send("evm_mine", []);
			await expect(staking.connect(user).withdrawReward(tokenId)).to.be.revertedWith(
				"Not enough token available",
			);
		});

		it("user can withdraw rewards", async function () {
			const delay = await staking.INTERVAL();
			const reward = await staking.REWARD();
			await ethers.provider.send("evm_increaseTime", [delay.toNumber()]);
			await ethers.provider.send("evm_mine", []);
			await erc20.connect(owner).transfer(staking.address, reward);
			await expect(() => staking.connect(user).withdrawReward(tokenId)).to.changeTokenBalance(
				erc20,
				user,
				reward,
			);
		});

		it("user can withdraw NFT", async function () {
			await staking.connect(user).withdrawNFT(tokenId);
			expect(await erc721.balanceOf(staking.address)).to.equal(0);
			expect(await erc721.balanceOf(user.address)).to.equal(1);
		});
	});
});
