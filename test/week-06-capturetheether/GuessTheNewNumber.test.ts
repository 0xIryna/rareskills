import { ethers } from 'hardhat';
import { utils } from 'ethers';
import { expect } from 'chai';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { GuessTheNewNumberChallenge, GuessTheNewNumberSolution } from '../../typechain-types';

describe('GuessTheNewNumber', function () {
    let owner: SignerWithAddress;
    let user: SignerWithAddress;
    let challenge: GuessTheNewNumberChallenge;
    let solution: GuessTheNewNumberSolution;

    beforeEach(async function () {
        [owner, user] = await ethers.getSigners();
        const challengeFactory = await ethers.getContractFactory('GuessTheNewNumberChallenge');
        challenge = (await challengeFactory
            .connect(owner)
            .deploy({ value: utils.parseEther('1') })) as GuessTheNewNumberChallenge;

        const solutionFactory = await ethers.getContractFactory('GuessTheNewNumberSolution');
        solution = (await solutionFactory.connect(owner).deploy(challenge.address)) as GuessTheNewNumberSolution;
    });

    it('solves the challenge', async function () {
        await expect(() => solution.connect(user).solve({ value: utils.parseEther('1') })).to.changeEtherBalance(
            user,
            utils.parseEther('1'),
        );
        expect(await challenge.isComplete()).to.be.true;
    });
});
