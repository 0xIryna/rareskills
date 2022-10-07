// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.17;

import "./TokenSaleERC20.sol";

contract RefundableERC20 is TokenSaleERC20 {
    uint256 public constant SELL_RATE = 2000;

    constructor(string memory name_, string memory symbol_) TokenSaleERC20(name_, symbol_) {}

    function buy() external payable override {
        require(msg.value > 0, "Not enough");
        uint256 heldTokens = balanceOf(address(this));
        uint256 requiredTokens = msg.value * BUY_RATE;

        if (heldTokens < requiredTokens) {
            uint256 tokensToMint = requiredTokens - heldTokens;
            require(tokensToMint + totalSupply() <= MAX_TOTAL_SUPPLY, "Not enough tokens available");
            _mint(address(this), tokensToMint);
        }

        _transfer(address(this), msg.sender, requiredTokens);
    }

    function sellBack(uint256 amount) external {
        require(amount > 0, "Not enough");
        uint256 heldEth = address(this).balance;
        uint256 requiredEth = amount / SELL_RATE;
        require(requiredEth <= heldEth, "Not enough ETH available");

        _transfer(msg.sender, address(this), amount);
        payable(msg.sender).transfer(requiredEth);
    }
}
