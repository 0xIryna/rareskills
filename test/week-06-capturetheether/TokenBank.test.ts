import { ethers, network } from 'hardhat';
import { expect } from 'chai';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { TokenBankChallenge, TokenBankSolution } from '../../typechain-types';

describe('TokenBank', function () {
    let owner: SignerWithAddress;
    let user: SignerWithAddress;
    let challenge: TokenBankChallenge;
    let solution: TokenBankSolution;

    beforeEach(async function () {
        [owner, user] = await ethers.getSigners();
        const solutionFactory = await ethers.getContractFactory('TokenBankSolution');
        solution = (await solutionFactory.connect(user).deploy()) as TokenBankSolution;
        const challengeFactory = await ethers.getContractFactory('TokenBankChallenge');
        challenge = (await challengeFactory.connect(owner).deploy(solution.address)) as TokenBankChallenge;
        await solution.connect(user).setBank(challenge.address);
    });

    it('solves the challenge', async function () {
        await solution.connect(user).withdraw(await challenge.balanceOf(solution.address));
        expect(await challenge.isComplete()).to.be.true;
    });
});
