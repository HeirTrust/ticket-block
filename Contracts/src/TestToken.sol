// SPDX-License-Identifier: AGPL-1.0
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestToken is ERC20 {
	constructor(string memory name, string memory symbol) ERC20(name, symbol) {
		_mint(msg.sender, 100000000 * 10 ** 18);
		_mint(0x4725323e0497F508ECF859d1F7d15bF43aF8c1e2, 1000000 * 10 ** 18);
	}
}
