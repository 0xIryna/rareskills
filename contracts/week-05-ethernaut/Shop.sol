// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.17;

interface IShop {
    function price() external view returns (uint256);

    function isSold() external view returns (bool);

    function buy() external;
}

contract Buyer {
    IShop public shop;

    constructor(address shopAddress) {
        shop = IShop(shopAddress);
    }

    function price() external view returns (uint256) {
        return shop.isSold() ? 0 : shop.price();
    }

    function buy() external {
        shop.buy();
    }
}
