import { ethers } from 'hardhat';
import { utils } from 'ethers';
import { expect } from 'chai';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { PredictTheFutureChallenge, PredictTheFutureSolution } from '../../typechain-types';

describe('PredictTheFuture', function () {
    let owner: SignerWithAddress;
    let user: SignerWithAddress;
    let challenge: PredictTheFutureChallenge;
    let solution: PredictTheFutureSolution;

    beforeEach(async function () {
        [owner, user] = await ethers.getSigners();
        const challengeFactory = await ethers.getContractFactory('PredictTheFutureChallenge');
        challenge = (await challengeFactory
            .connect(owner)
            .deploy({ value: utils.parseEther('1') })) as PredictTheFutureChallenge;

        const solutionFactory = await ethers.getContractFactory('PredictTheFutureSolution');
        solution = (await solutionFactory.connect(owner).deploy(challenge.address)) as PredictTheFutureSolution;
    });

    it('solves the challenge', async function () {
        await solution.connect(user).lockInGuess({ value: utils.parseEther('1') });
        let isComplete = false;
        while (!isComplete) {
            await ethers.provider.send('evm_mine', []);
            await solution.connect(user).settle();
            isComplete = await challenge.isComplete();
        }

        expect(await challenge.isComplete()).to.be.true;
    });
});
