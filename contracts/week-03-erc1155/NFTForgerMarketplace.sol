// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.17;

import "./ForgeableNFT.sol";

contract NFTForgerMarketplace {
    uint256 public constant MAX_MINTABLE_TOKEN = 2;
    uint256 public constant COOLDOWN = 1 minutes;

    ForgeableNFT public nft;
    mapping(address => uint256) public mintTime;

    constructor(address nftAddress) {
        nft = ForgeableNFT(nftAddress);
    }

    function mint(uint256 tokenId) external {
        require(tokenId <= MAX_MINTABLE_TOKEN, "Only tokens 0-2 can be minted");
        require(mintTime[msg.sender] + COOLDOWN <= block.timestamp, "Try later");

        mintTime[msg.sender] = block.timestamp;
        nft.mint(msg.sender, tokenId);
    }

    function trade(uint256 tokenIdIn, uint256 tokenIdOut) external {
        require(tokenIdIn != tokenIdOut, "Token Ids must be different");
        require(tokenIdOut <= MAX_MINTABLE_TOKEN, "Token out must be 0-2");
        require(nft.balanceOf(msg.sender, tokenIdIn) > 0, "Insufficient balance");
        nft.burn(msg.sender, tokenIdIn);
        nft.mint(msg.sender, tokenIdOut);
    }

    /*
        Token 3 can be minted by burning token 0 and 1.
        Token 4 can be minted by burning token 1 and 2
        Token 5 can be minted by burning 0 and 2
        Token 6 can be minted by burning 0, 1, and 2
    */
    function forge(uint256[] calldata tokenIdsToBurn) external {
        uint256 length = tokenIdsToBurn.length;
        require(length == 2 || length == 3, "Incorrect number of tokens");
        uint256 tokenIdToMint = 0;

        if (length == 2) {
            if (tokenIdsToBurn[0] == 0) {
                if (tokenIdsToBurn[1] == 1) {
                    tokenIdToMint = 3;
                }
                if (tokenIdsToBurn[1] == 2) {
                    tokenIdToMint = 5;
                }
            } else if (tokenIdsToBurn[0] == 1 && tokenIdsToBurn[1] == 2) {
                tokenIdToMint = 4;
            }
        } else if (tokenIdsToBurn[0] == 0 && tokenIdsToBurn[1] == 1 && tokenIdsToBurn[2] == 2) {
            tokenIdToMint = 6;
        }

        require(tokenIdToMint > 0, "Tokens or their order are incorrect");

        for (uint256 i = 0; i < tokenIdsToBurn.length; i++) {
            nft.burn(msg.sender, tokenIdsToBurn[i]);
        }
        nft.mint(msg.sender, tokenIdToMint);
    }

    function burn(uint256 tokenId) external {
        require(tokenId > MAX_MINTABLE_TOKEN, "Only tokens 3-6 can be burned");
        nft.burn(msg.sender, tokenId);
    }
}
