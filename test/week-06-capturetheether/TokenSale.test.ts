import { ethers } from 'hardhat';
import { expect } from 'chai';
import { utils } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { TokenSaleChallenge, TokenSaleOverflowHelper } from '../../typechain-types';

describe('TokenSale', function () {
    let owner: SignerWithAddress;
    let user: SignerWithAddress;
    let challenge: TokenSaleChallenge;
    let helper: TokenSaleOverflowHelper;

    beforeEach(async function () {
        [owner, user] = await ethers.getSigners();
        const challengeFactory = await ethers.getContractFactory('TokenSaleChallenge');
        challenge = (await challengeFactory
            .connect(owner)
            .deploy({ value: utils.parseEther('1') })) as TokenSaleChallenge;

        const helperFactory = await ethers.getContractFactory('TokenSaleOverflowHelper');
        helper = await helperFactory.connect(owner).deploy(challenge.address);
    });

    it('solves the challenge', async function () {
        const result = await helper.calculateTokenNumberAndValue();
        await challenge.connect(user).buy(result[0], { value: result[1] });
        await challenge.connect(user).sell(1);
        expect(await challenge.isComplete()).to.be.true;
    });
});
