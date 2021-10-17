const fs = require("fs");
const SquareVerifier = artifacts.require("SquareVerifier");
const SolnSquareVerifier = artifacts.require("SolnSquareVerifier");
const correctProof = JSON.parse(fs.readFileSync("./proof.json"));

contract("TestSolnSquareVerifier", (accounts) => {
  beforeEach(async function () {
    this.verifier = await SquareVerifier.new();
    this.contract = await SolnSquareVerifier.new(
      this.verifier.address,
      "Test Token",
      "TEST"
    );
  });

  it("should mint a new token for a new correct proof", async function () {
    const originalSupply = await this.contract.totalSupply();
    await this.contract.mint(
      correctProof.proof,
      correctProof.inputs,
      accounts[1],
      2
    );
    const newSupply = await this.contract.totalSupply();
    assert.equal(
      newSupply.toNumber(),
      originalSupply.toNumber() + 1,
      "New token did not get minted"
    );
  });

  it("should not allow an existing proof to be reused", async function () {
    // Use proof once for initial minting
    await this.contract.mint(
      correctProof.proof,
      correctProof.inputs,
      accounts[1],
      3
    );

    const originalSupply = await this.contract.totalSupply();
    let reverted = false;
    try {
      await this.contract.mint(
        correctProof.proof,
        correctProof.inputs,
        accounts[1],
        3
      );
    } catch (e) {
      reverted = true;
    }
    assert.equal(reverted, true, "Minted should have reverted");

    const newSupply = await this.contract.totalSupply();
    assert.equal(
      newSupply.toNumber(),
      originalSupply.toNumber(),
      "New token should not be minted"
    );
  });

  it("should not allow minting with a failing proof", async function () {
    // Simulate a cheated proof provided in docs https://zokrates.github.io/examples/rng_tutorial.html
    cheat = [...correctProof.inputs];
    cheat[cheat.length - 1] = cheat[cheat.length - 1].replace(
      /[01]$/,
      cheat[cheat.length - 1][65] == "1" ? "0" : "1"
    );

    const originalSupply = await this.contract.totalSupply();
    let reverted = false;
    try {
      await this.contract.mint(correctProof.proof, cheat, accounts[1], 4);
    } catch (e) {
      reverted = true;
    }
    assert.equal(reverted, true, "Minted should have reverted");

    const newSupply = await this.contract.totalSupply();
    assert.equal(
      newSupply.toNumber(),
      originalSupply.toNumber(),
      "New token should not be minted"
    );
  });
});
