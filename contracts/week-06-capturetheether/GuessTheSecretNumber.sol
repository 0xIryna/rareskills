// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.17;

contract GuessTheSecretNumberChallenge {
    bytes32 public answerHash = 0xdb81b4d58595fbbbb592d3661a34cdca14d7ab379441400cbfa1b78bc447c365;

    constructor() payable {
        require(msg.value == 1 ether, "Send 1 ether");
    }

    function isComplete() external view returns (bool) {
        return address(this).balance == 0;
    }

    function guess(uint8 n) external payable {
        require(msg.value == 1 ether, "Send 1 ether");

        if (keccak256(abi.encodePacked(n)) == answerHash) {
            payable(msg.sender).transfer(2 ether);
        }
    }
}

contract GuessTheSecretNumberSolution {
    GuessTheSecretNumberChallenge public challenge;

    constructor(address payable challengeAddress) payable {
        require(challengeAddress != address(0), "Invalid address");
        challenge = GuessTheSecretNumberChallenge(challengeAddress);
    }

    function findNumber() external view returns (uint8) {
        uint8 max = type(uint8).max;
        bytes32 answerHash = challenge.answerHash();

        for (uint8 i = 0; i < max; i++) {
            if (keccak256(abi.encodePacked(i)) == answerHash) {
                return i;
            }
        }

        revert("Not found");
    }
}
