// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ForgeableNFT is ERC1155, Ownable {
    uint256 public constant MAX_TOKEN_SUPPLY = 7;

    address public marketplace;

    event MarketPlaceChanged(address indexed _newMarketPlace);

    constructor(string memory uri_) ERC1155(uri_) {}

    modifier onlyMarketplace() {
        require(msg.sender == marketplace, "Not the marketplace");
        _;
    }

    function setMarketplace(address marketplaceAddress) external onlyOwner {
        require(marketplaceAddress != address(0), "Invalid address");
        marketplace = marketplaceAddress;
        emit MarketPlaceChanged(marketplaceAddress);
    }

    function mint(address to, uint256 id) external onlyMarketplace {
        _mint(to, id, 1, "");
    }

    function burn(address from, uint256 id) external onlyMarketplace {
        _burn(from, id, 1);
    }

    function balanceOfAllTokens(address account) external view returns (uint256[] memory) {
        uint256[] memory balances = new uint256[](MAX_TOKEN_SUPPLY);

        for (uint256 i = 0; i < MAX_TOKEN_SUPPLY; i++) {
            balances[i] = balanceOf(account, i);
        }

        return balances;
    }
}
