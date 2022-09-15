// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract SanctionableERC20 is ERC20 {

	mapping(address => bool) public sanctioned;
	address private immutable centralizedAuthority;

	constructor(string memory _name, string memory _symbol, address _centralizedAuthority) ERC20(_name, _symbol) {
		require(_centralizedAuthority != address(0));
		centralizedAuthority = _centralizedAuthority;
	}

	function updateSanctioned(address account, bool isSanctioned) external {
		require(msg.sender == centralizedAuthority, "Not a centralized authority");
		sanctioned[account] = isSanctioned;
	}

	function _beforeTokenTransfer(address from, address to, uint256) internal override view {
		require(!sanctioned[from] && !sanctioned[to], "Sanctioned");
	}
}