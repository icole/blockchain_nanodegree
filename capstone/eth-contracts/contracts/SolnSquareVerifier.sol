/* SPDX-License-Identifier: MIT */

pragma solidity ^0.8.7;

import "./ERC721Mintable.sol";

contract SolnSquareVerifier is ERC721Mintable {
    ISquareVerifier private squareVerifier;

    mapping(bytes32 => bool) private _usedSolutions;

    event SolutionAdded(bytes32 solutionHash);

    constructor(
        address verifierAddress,
        string memory name,
        string memory symbol
    ) ERC721Mintable(name, symbol) {
        squareVerifier = ISquareVerifier(verifierAddress);
    }

    function _verify(
        ISquareVerifier.Proof memory proof,
        uint256[2] memory input
    ) internal view returns (bool r) {
        return squareVerifier.verifyTx(proof, input);
    }

    function _addSolution(bytes32 solutionHash_) internal {
        _usedSolutions[solutionHash_] = true;
        emit SolutionAdded(solutionHash_);
    }

    function _solutionHash(
        ISquareVerifier.Proof memory proof,
        uint256[2] memory input
    ) internal pure returns (bytes32) {
        return
            keccak256(
                abi.encodePacked(
                    proof.a.X,
                    proof.a.Y,
                    proof.b.X,
                    proof.b.Y,
                    proof.c.X,
                    proof.c.Y,
                    input
                )
            );
    }

    function mint(
        ISquareVerifier.Proof memory proof,
        uint256[2] memory inputs,
        address to,
        uint256 tokenId
    ) external returns (bool) {
        bytes32 solutionHash = _solutionHash(proof, inputs);
        require(
            _usedSolutions[solutionHash] == false,
            "Solution has already been used"
        );
        _addSolution(solutionHash);
        require(
            _verify(proof, inputs) == true,
            "Solution failed to be verified"
        );

        return super.mint(to, tokenId);
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
