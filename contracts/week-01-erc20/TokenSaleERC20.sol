// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TokenSaleERC20 is ERC20, Ownable {

	uint256 public constant maxTotalSupply = 1_000_000 ether;
	uint256 public constant buyRate = 1000;
	bool public saleActive = true;

	constructor(string memory name, string memory symbol) ERC20(name, symbol) {		
	}

	function buy() external virtual payable {
		require(saleActive, "Sale is closed");
		require(msg.value > 0, "Not enough");

		uint256 tokensToMint = msg.value * buyRate;
		require(totalSupply() + tokensToMint <= maxTotalSupply, "Too much");
		_mint(msg.sender, tokensToMint);

		if (totalSupply() == maxTotalSupply) {
			saleActive = false;
		}
	}

	function withdraw() onlyOwner external {
		payable(owner()).transfer(address(this).balance);
	}
}