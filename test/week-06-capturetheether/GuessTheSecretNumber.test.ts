import { ethers } from 'hardhat';
import { utils } from 'ethers';
import { expect } from 'chai';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { GuessTheSecretNumberChallenge, GuessTheSecretNumberSolution } from '../../typechain-types';

describe('GuessTheSecretNumber', function () {
    let owner: SignerWithAddress;
    let user: SignerWithAddress;
    let challenge: GuessTheSecretNumberChallenge;
    let solution: GuessTheSecretNumberSolution;

    beforeEach(async function () {
        [owner, user] = await ethers.getSigners();
        const challengeFactory = await ethers.getContractFactory('GuessTheSecretNumberChallenge');
        challenge = (await challengeFactory
            .connect(owner)
            .deploy({ value: utils.parseEther('1') })) as GuessTheSecretNumberChallenge;

        const solutionFactory = await ethers.getContractFactory('GuessTheSecretNumberSolution');
        solution = (await solutionFactory.connect(owner).deploy(challenge.address)) as GuessTheSecretNumberSolution;
    });

    it('solves the challenge', async function () {
        const secretNumber: number = await solution.findNumber();
        await expect(() =>
            challenge.connect(user).guess(secretNumber, { value: utils.parseEther('1') }),
        ).to.changeEtherBalance(user, utils.parseEther('1'));
        expect(await challenge.isComplete()).to.be.true;
    });
});
