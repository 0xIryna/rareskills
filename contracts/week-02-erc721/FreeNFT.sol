// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract FreeNFT is ERC721("Free Avatar NFT", "FREE") {
	uint8 public constant MAX_SUPPLY = 10;
	uint8 public tokenId;

	function mint() external {
		require(tokenId < MAX_SUPPLY, "Max supply reached");
		_mint(msg.sender, tokenId++);
	}

	function _baseURI() internal pure override returns (string memory) {
        return "ipfs://QmePheK3iGURiuzw8qJhcpj1NVWN1cQyZEgF5x6KQF2XZ9/";
    }
}