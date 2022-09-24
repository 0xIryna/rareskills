// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SaleNFT is ERC721("Avatar NFT", "AVTR"), Ownable {
	uint8 public constant MAX_SUPPLY = 10;
	uint8 public tokenId;
	address public marketplace;

	function setMarketplace(address marketplaceAddress) onlyOwner external {
		require(msg.sender != address(0), "Invalid address");
		marketplace = marketplaceAddress;
	}

	function mint(address to) external {
		require(msg.sender == marketplace, "Not a marketplace");
		require(tokenId < MAX_SUPPLY, "Max supply reached");
		_mint(to, tokenId++);
	}

	function _baseURI() internal pure override returns (string memory) {
        return "ipfs://QmePheK3iGURiuzw8qJhcpj1NVWN1cQyZEgF5x6KQF2XZ9/";
    }
}