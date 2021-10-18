const contract = require("@truffle/contract");
const HDWalletProvider = require("@truffle/hdwallet-provider");
const fs = require("fs");

const infuraKey = fs.readFileSync(".infura_key").toString().trim();
const mnemonic = fs.readFileSync(".secret").toString().trim();

const CREATOR_ADDRESS = "0x27d8d15cbc94527cadf5ec14b69519ae23288b95";
const OWNER_ADDRESS = "0x018C2daBef4904ECbd7118350A0c54DbeaE3549A";
const ABI = JSON.parse(
  fs.readFileSync("./build/contracts/SolnSquareVerifier.json")
);

async function main() {
  let provider = new HDWalletProvider(
    mnemonic,
    "https://rinkeby.infura.io/v3/" + infuraKey
  );
  let SolnSquareVerifier = contract(ABI);
  SolnSquareVerifier.defaults({
    from: CREATOR_ADDRESS,
    gasPrice: 94000000000,
    gas: 4698712,
  });
  SolnSquareVerifier.setProvider(provider);
  const instance = await SolnSquareVerifier.deployed();
  let proof, supply;
  for (let i = 2; i < 10; i++) {
    try {
      proof = JSON.parse(fs.readFileSync(`./proofs/proof-${i}.json`));
      await instance.verifiedMint(proof.proof, proof.inputs, OWNER_ADDRESS, i, {
        from: CREATOR_ADDRESS,
      });
      console.log("Minted Token:", i);
      supply = await instance.totalSupply({ from: CREATOR_ADDRESS });
      console.log("New Supply:", supply.toNumber());
    } catch (e) {
      console.log(e);
    }
  }
}

main();
