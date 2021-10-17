const fs = require("fs");
const SquareVerifier = artifacts.require("SquareVerifier");
const correctProof = JSON.parse(fs.readFileSync("./proof.json"));
const incorrectProof = JSON.parse(fs.readFileSync("./failing_proof.json"));

contract("TestSquareVerifier", (accounts) => {
  beforeEach(async function () {
    this.contract = await SquareVerifier.new();
  });

  it("should return true for correct proof", async function () {
    const result = await this.contract.verifyTx(
      correctProof.proof,
      correctProof.inputs
    );
    expect(result == true, "Proof should return valid result");
  });

  it("should return false for incorrect proof", async function () {
    const result = await this.contract.verifyTx(
      incorrectProof.proof,
      incorrectProof.inputs
    );
    expect(result == false, "Proof should not return valid result");
  });
});
