// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.17;

import "./TokenSaleERC20.sol";

contract RefundableERC20 is TokenSaleERC20 {

	uint256 constant sellRate = 2000;

	constructor(string memory name, string memory symbol) TokenSaleERC20(name, symbol) {		
	}

	function buy() external override payable {
		require(msg.value > 0, "Not enough");
		uint256 heldTokens = balanceOf(address(this));
		uint256 requiredTokens = msg.value * buyRate;

		if (heldTokens < requiredTokens) {
			uint256 tokensToMint = requiredTokens - heldTokens;
			require(tokensToMint + totalSupply() <= maxTotalSupply, "Not enough tokens available");
			_mint(address(this), tokensToMint);
		}

		_transfer(address(this), msg.sender, requiredTokens);
	}

	function sellBack(uint256 amount) external {
		require(amount > 0, "Not enough");
		uint256 heldEth = address(this).balance;
		uint256 requiredEth = amount / sellRate;
		require(requiredEth <= heldEth, "Not enough ETH available");

		_transfer(msg.sender, address(this), amount);
		payable(msg.sender).transfer(requiredEth);
	}
}