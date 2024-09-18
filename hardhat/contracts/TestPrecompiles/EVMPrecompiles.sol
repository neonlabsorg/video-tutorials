// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract EVMPrecompiles {

    event ReturnCalldata(bytes value);
    event ReturnBigModExpResult(bytes32 value);
    event ReturnBn256AddResult(bytes32[2] value);
    event ReturnBn256ScalarMulResult(bytes32[2] value);
    event ReturnBn256PairingResult(bytes32 value);
    event ReturnBlake2FResult(bytes32[2] value);
    event ReturnKzgResult(bytes value);

    // 0x01
    function recoverSignature(bytes32 hash, uint8 v, bytes32 r, bytes32 s) public pure returns (address) {
        address recovered = ecrecover(hash, v, r, s);
        require(recovered != address(0), "signature is invalid");
        return recovered;
    }

    //0x02
    function hashSha256(uint256 numberToHash) public view returns (bytes32 h) {
		(bool ok, bytes memory out) = address(2).staticcall(abi.encode(numberToHash));
		require(ok);
		h = abi.decode(out, (bytes32));
    }

    //0x03
    function hashRIPEMD160(bytes calldata data) public view returns (bytes20 h) {
        (bool ok, bytes memory out) = address(3).staticcall(data);
        require(ok);
        h = bytes20(abi.decode(out, (bytes32)) << 96);
    }

    //0x04
    function callDatacopy(bytes memory data) public returns (bytes memory) {
        bytes memory ret = new bytes(data.length);
        assembly {
            let len := mload(data)
            if iszero(call(gas(), 0x04, 0, add(data, 0x20), len, add(ret,0x20), len)) {
                invalid()
            }
        }
        emit ReturnCalldata(ret);
        return ret;
    } 

    //0x05
    function callBigModExp(bytes32 base, bytes32 exponent, bytes32 modulus) public returns (bytes32 result) {
        assembly {
            // free memory pointer
            let memPtr := mload(0x40)

            // length of base, exponent, modulus
            mstore(memPtr, 0x20)
            mstore(add(memPtr, 0x20), 0x20)
            mstore(add(memPtr, 0x40), 0x20)

            // assign base, exponent, modulus
            mstore(add(memPtr, 0x60), base)
            mstore(add(memPtr, 0x80), exponent)
            mstore(add(memPtr, 0xa0), modulus)

            // call the precompiled contract BigModExp (0x05)
            let success := call(gas(), 0x05, 0x0, memPtr, 0xc0, memPtr, 0x20)
            switch success
            case 0 {
                revert(0x0, 0x0)
            } default {
                result := mload(memPtr)
            }
        }
        emit ReturnBigModExpResult(result);
    }

    //0x06
    function callBn256Add(bytes32 ax, bytes32 ay, bytes32 bx, bytes32 by) public returns (bytes32[2] memory result) {
        bytes32[4] memory input;
        input[0] = ax;
        input[1] = ay;
        input[2] = bx;
        input[3] = by;
        assembly {
            let success := call(gas(), 0x06, 0, input, 0x80, result, 0x40)
            switch success
            case 0 {
                revert(0,0)
            }
        }
        emit ReturnBn256AddResult(result);
    }

    //0x07
    function callBn256ScalarMul(bytes32 x, bytes32 y, bytes32 scalar) public returns (bytes32[2] memory result) {
        bytes32[3] memory input;
        input[0] = x;
        input[1] = y;
        input[2] = scalar;
        assembly {
            let success := call(gas(), 0x07, 0, input, 0x60, result, 0x40)
            switch success
            case 0 {
                revert(0,0)
            }
        }
        emit ReturnBn256ScalarMulResult(result);
    }

    //0x08
    function callBn256Pairing(bytes memory input) public returns (bytes32 result) {
    // input is a serialized bytes stream of (a1, b1, a2, b2, ..., ak, bk) from (G_1 x G_2)^k
        uint256 len = input.length;
        require(len % 192 == 0);
        assembly {
            let memPtr := mload(0x40)
            let success := call(gas(), 0x08, 0, add(input, 0x20), len, memPtr, 0x20)
            switch success
            case 0 {
                revert(0,0)
            } default {
                result := mload(memPtr)
            }
        }
        emit ReturnBn256PairingResult(result);
    }

    //0x09
    function callBlake2F(uint32 rounds, bytes32[2] memory h, bytes32[4] memory m, bytes8[2] memory t, bool f) public returns (bytes32[2] memory) {
        bytes32[2] memory output;
        bytes memory args = abi.encodePacked(rounds, h[0], h[1], m[0], m[1], m[2], m[3], t[0], t[1], f);
        assembly {
            if iszero(staticcall(not(0), 0x09, add(args, 32), 0xd5, output, 0x40)) {
                revert(0, 0)
            }
        }
        emit ReturnBlake2FResult(output);
        return output;
    }

    //0x0a
    function callKzg(bytes memory input) public returns (bytes memory) {
        require(input.length == 192, "Input must be 192 bytes");
        bytes memory ret = new bytes(64); // Adjust this size as necessary
        assembly {
            let success := call(
                gas(),        // Pass all available gas
                0x0a,         // Address of the precompile
                0,            // No value (ETH) to send
                add(input, 0x20), // Pointer to the input data
                192,          // Length of input data
                add(ret, 0x20),   // Pointer to the return data
                64            // Size of return data (adjust as necessary)
            )
            if iszero(success) {
                revert(0, 0)
            }
        }
        emit ReturnKzgResult(ret);
        return ret;
    }

}