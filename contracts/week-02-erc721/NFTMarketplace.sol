// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./SaleNFT.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTMarketplace is Ownable {
	uint256 TOKEN_PER_NFT = 10 ether;
	
	IERC20 public erc20Token;
	SaleNFT public erc721Token;

	constructor(address erc20TokenAddress, address erc721TokenAddress) {
		require(erc20TokenAddress != address(0), "Invalid address");
		erc20Token = IERC20(erc20TokenAddress);
		erc721Token = SaleNFT(erc721TokenAddress);
	}

	function mint() external {
		erc20Token.transferFrom(msg.sender, address(this), TOKEN_PER_NFT);
		erc721Token.mint(msg.sender);
	}

	function withdrawTokens() onlyOwner external {
		erc20Token.transfer(msg.sender, erc20Token.balanceOf(address(this)));
	}
}