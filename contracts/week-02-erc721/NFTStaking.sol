// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTStaking is IERC721Receiver, Ownable {
    uint256 public constant REWARD = 10 ether;
    uint256 public constant INTERVAL = 24 hours;

    IERC20 public erc20Token;
    IERC721 public erc721Token;
    mapping(uint256 => address) public staked;
    mapping(uint256 => uint256) public lastRewardWithdrawal;

    constructor(address erc20TokenAddress, address erc721TokenAddress) {
        require(erc20TokenAddress != address(0), "Invalid address");
        require(erc721TokenAddress != address(0), "Invalid address");
        erc20Token = IERC20(erc20TokenAddress);
        erc721Token = IERC721(erc721TokenAddress);
    }

    function onERC721Received(
        address,
        address from,
        uint256 tokenId,
        bytes calldata
    ) external returns (bytes4) {
        staked[tokenId] = from;
        lastRewardWithdrawal[tokenId] = block.timestamp;
        return IERC721Receiver.onERC721Received.selector;
    }

    function stake(uint256 tokenId) external {
        erc721Token.safeTransferFrom(msg.sender, address(this), tokenId);
    }

    function withdrawReward(uint256 tokenId) external {
        require(msg.sender == staked[tokenId], "Not an NFT owner");
        require(block.timestamp >= lastRewardWithdrawal[tokenId] + INTERVAL, "Try later");
        require(erc20Token.balanceOf(address(this)) >= REWARD, "Not enough token available");
        erc20Token.transfer(msg.sender, REWARD);
    }

    function withdrawNFT(uint256 tokenId) external {
        require(msg.sender == staked[tokenId], "Not an NFT owner");
        delete staked[tokenId];
        erc721Token.safeTransferFrom(address(this), msg.sender, tokenId);
    }
}
