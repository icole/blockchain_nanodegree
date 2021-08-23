# Project Overview

This is my completed implementation of the Coffee Supply Chain project for the Udacity Blockchain Nanodegree. The initial [starter code](https://github.com/udacity/nd1309-Project-6b-Example-Template) for this project was used as a template

## Motivation / Architectural Overview

The goal of this project is to create an Ethereum backed supply chain to follow the lifecycle of coffee beans from when a farmer first harvests them, processes them, sells them to a distributor, who then ships them to a retailer that finally sells them to an end consumer.

The main functions to transition through the lifecycle are implemented in the [`SupplyChain.sol`](https://github.com/icole/blockchain_nanodegree/blob/master/project_3/contracts/coffeebase/SupplyChain.sol) Solidity Contract.

Each particular step in the supply chain can only be executed by the respective party in that particular piece of the chain (Farmer, Distributor, Retailer, Consumer). These roles and the logic to ensure that only they can perform certain actions are implemented in the [Access Control Contracts](https://github.com/icole/blockchain_nanodegree/tree/master/project_3/contracts/coffeeaccesscontrol).

By providing this access control throughout the entire lifecycle the end user can verify the authenticity of every upstream piece of the chain (Farmer, Distributor, Retailer).![Supply-Chain-History](https://user-images.githubusercontent.com/1242292/130404708-79a8a265-98ea-409f-a048-9a5d5f797c21.png)


## Rinkeby Contract

Transaction - [0xe11d9dc88cba431b53696244fa477cc861ef048379a78ba0a8cbe05315c021f4](https://rinkeby.etherscan.io/tx/0xe11d9dc88cba431b53696244fa477cc861ef048379a78ba0a8cbe05315c021f4)


Contract - [0x7c62aF24FB6b00F9C7B9E1b5A0cC72D6a4A5e485](https://rinkeby.etherscan.io/address/0x7c62af24fb6b00f9c7b9e1b5a0cc72d6a4a5e485)

## Built With

- [Ethereum](https://www.ethereum.org/) - Ethereum is a decentralized platform that runs smart contracts
- [Truffle Framework](http://truffleframework.com/) - Truffle is the most popular development framework for Ethereum with a mission to make your life a whole lot easier.

## Acknowledgments

- Solidity
- Ganache-cli
- Truffle
- IPFS
