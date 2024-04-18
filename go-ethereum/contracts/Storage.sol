// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.24;
/**
* @title Storage
* @dev store or retrieve variable value
*/

contract Storage {

	uint256 value;

	function store(uint256 number) public {
		value = number;
	}

	function retrieve() public view returns (uint256) {
		return value;
	}
}