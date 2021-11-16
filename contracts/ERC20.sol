// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.10;

import "./node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MlibreToken is ERC20 {
    constructor(uint256 initialSupply) ERC20("Mlibre", "MLB") {
        _mint(msg.sender, initialSupply * (10**uint256(decimals())));
    }
}
