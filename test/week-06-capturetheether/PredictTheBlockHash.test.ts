import { ethers, network } from 'hardhat';
import { utils } from 'ethers';
import { expect } from 'chai';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { PredictTheBlockHashChallenge } from '../../typechain-types';

describe('PredictTheBlockHash', function () {
    let owner: SignerWithAddress;
    let user: SignerWithAddress;
    let challenge: PredictTheBlockHashChallenge;

    beforeEach(async function () {
        [owner, user] = await ethers.getSigners();
        const challengeFactory = await ethers.getContractFactory('PredictTheBlockHashChallenge');
        challenge = (await challengeFactory
            .connect(owner)
            .deploy({ value: utils.parseEther('1') })) as PredictTheBlockHashChallenge;
    });

    it('solves the challenge', async function () {
        await challenge.connect(user).lockInGuess(utils.formatBytes32String(''), { value: utils.parseEther('1') });
        //console.log((await ethers.provider.getBlock('latest')).number);
        await network.provider.send('hardhat_mine', ['0x101']); // mine 257 blocks
        //console.log((await ethers.provider.getBlock('latest')).number);

        await expect(() => challenge.connect(user).settle()).to.changeEtherBalance(user, utils.parseEther('2'));
        expect(await challenge.isComplete()).to.be.true;
    });
});
