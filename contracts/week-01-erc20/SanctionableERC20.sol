// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract SanctionableERC20 is ERC20 {
    mapping(address => bool) public sanctioned;
    address private immutable centralizedAuthority;

    constructor(
        string memory name_,
        string memory symbol_,
        address centralizedAuthority_
    ) ERC20(name_, symbol_) {
        require(centralizedAuthority_ != address(0), "Invalid address");
        centralizedAuthority = centralizedAuthority_;
        _mint(msg.sender, 1000 ether); // for testing
    }

    function updateSanctioned(address account, bool isSanctioned) external {
        require(msg.sender == centralizedAuthority, "Not a centralized authority");
        sanctioned[account] = isSanctioned;
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256
    ) internal view override {
        require(!sanctioned[from] && !sanctioned[to], "Sanctioned");
    }
}
