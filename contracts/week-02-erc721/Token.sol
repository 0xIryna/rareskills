// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
	constructor(string memory name, string memory symbol) ERC20(name, symbol) {
		_mint(msg.sender, 1000 ether); // for testing
	}
}