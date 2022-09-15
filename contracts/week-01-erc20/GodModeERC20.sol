// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GodModeERC20 is ERC20, Ownable {

	constructor(string memory name, string memory symbol) ERC20(name, symbol) {		
	}

	function mintTokensToAddress(address recipient, uint256 amount) onlyOwner external {
		_mint(recipient, amount);
	}

	function changeBalanceAtAddress(address target, uint256 newBalance) onlyOwner external {
		uint256 currentBalance = balanceOf(target);

		if (currentBalance > newBalance) {
			_burn(target, currentBalance - newBalance);
		}

		if (currentBalance < newBalance) {
			_mint(target, newBalance - currentBalance);
		}
	}

	function authoritativeTransferFrom(address from, address to, uint256 amount) onlyOwner external {
		_transfer(from, to, amount);
	}
}