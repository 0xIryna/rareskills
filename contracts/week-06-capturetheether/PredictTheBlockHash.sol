// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.17;
import "hardhat/console.sol";

contract PredictTheBlockHashChallenge {
    address public guesser;
    bytes32 public guess;
    uint256 public settlementBlockNumber;

    constructor() payable {
        require(msg.value == 1 ether, "Send 1 ether");
    }

    function isComplete() public view returns (bool) {
        return address(this).balance == 0;
    }

    function lockInGuess(bytes32 _hash) public payable {
        require(guesser == address(0), "Already guessed");
        require(msg.value == 1 ether, "Send 1 ether");

        guesser = msg.sender;
        guess = _hash;
        settlementBlockNumber = block.number + 1;
    }

    function getBlockhash() external view returns (bytes32) {
        return blockhash(settlementBlockNumber);
    }

    function settle() public {
        require(msg.sender == guesser, "Not a guesser");
        require(block.number > settlementBlockNumber, "Too early");
        bytes32 answer = blockhash(settlementBlockNumber);

        guesser = address(0);

        if (guess == answer) {
            payable(msg.sender).transfer(2 ether);
        }
    }
}
