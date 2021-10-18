const fs = require("fs");
const SquareVerifier = artifacts.require("SquareVerifier");
const correctProof = JSON.parse(fs.readFileSync("./proofs/proof-0.json"));

contract("TestSquareVerifier", (accounts) => {
  beforeEach(async function () {
    this.contract = await SquareVerifier.new();
  });

  it("should return true for correct proof", async function () {
    const result = await this.contract.verifyTx(
      correctProof.proof,
      correctProof.inputs
    );
    assert.equal(result, true, "Proof should return valid result");
  });

  it("should return false for incorrect proof", async function () {
    // Simulate a cheated proof provided in docs https://zokrates.github.io/examples/rng_tutorial.html
    cheat = [...correctProof.inputs];
    cheat[cheat.length - 1] = cheat[cheat.length - 1].replace(
      /[01]$/,
      cheat[cheat.length - 1][65] == "1" ? "0" : "1"
    );

    const result = await this.contract.verifyTx(correctProof.proof, cheat);
    assert.equal(result, false, "Proof should not return valid result");
  });
});
