// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.17;

interface IElevator {
    function goTo(uint256 _floor) external;
}

contract Building {
    IElevator public elevator;
    bool private isLastFloorCalled;

    constructor(address elevatorAddress) {
        elevator = IElevator(elevatorAddress);
    }

    function isLastFloor(uint256) external returns (bool) {
        if (isLastFloorCalled) {
            return true;
        }
        isLastFloorCalled = true;
        return false;
    }

    function goTo(uint256 floor) external {
        elevator.goTo(floor);
    }
}
