// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TokenSaleERC20 is ERC20, Ownable {
    uint256 public constant MAX_TOTAL_SUPPLY = 1_000_000 ether;
    uint256 public constant BUY_RATE = 1000;
    bool public saleActive = true;

    constructor(string memory name_, string memory symbol_) ERC20(name_, symbol_) {}

    function buy() external payable virtual {
        require(saleActive, "Sale is closed");
        require(msg.value > 0, "Not enough");

        uint256 tokensToMint = msg.value * BUY_RATE;
        require(totalSupply() + tokensToMint <= MAX_TOTAL_SUPPLY, "Too much");
        _mint(msg.sender, tokensToMint);

        if (totalSupply() == MAX_TOTAL_SUPPLY) {
            saleActive = false;
        }
    }

    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
