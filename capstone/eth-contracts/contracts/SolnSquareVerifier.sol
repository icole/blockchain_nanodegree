/* SPDX-License-Identifier: MIT */

pragma solidity ^0.8.7;

import "./ERC721Mintable.sol";

// TODO define a solutions struct that can hold an index & an address

// TODO define an array of the above struct

// TODO define a mapping to store unique solutions submitted

// TODO Create an event to emit when a solution is added

// TODO Create a function to add the solutions to the array and emit the event

// TODO Create a function to mint new NFT only after the solution has been verified
//  - make sure the solution is unique (has not been used before)
//  - make sure you handle metadata as well as tokenSuplly
contract SolnSquareVerifier is ERC721Mintable {
    ISquareVerifier private squareVerifier;

    constructor(
        address verifierAddress,
        string memory name,
        string memory symbol
    ) ERC721Mintable(name, symbol) {
        squareVerifier = ISquareVerifier(verifierAddress);
    }

    function verify(ISquareVerifier.Proof memory proof, uint256[2] memory input)
        internal
        view
        returns (bool r)
    {
        return squareVerifier.verifyTx(proof, input);
    }
}

interface ISquareVerifier {
    struct G1Point {
        uint256 X;
        uint256 Y;
    }

    struct G2Point {
        uint256[2] X;
        uint256[2] Y;
    }

    struct Proof {
        G1Point a;
        G2Point b;
        G1Point c;
    }

    function verifyTx(Proof memory proof, uint256[2] memory input)
        external
        view
        returns (bool r);
}
