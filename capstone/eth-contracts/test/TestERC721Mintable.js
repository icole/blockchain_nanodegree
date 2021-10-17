var ERC721Mintable = artifacts.require("ERC721Mintable");

contract("TestERC721Mintable", (accounts) => {
  const account_one = accounts[0];
  const account_two = accounts[1];

  describe("match erc721 spec", function () {
    beforeEach(async function () {
      this.contract = await ERC721Mintable.new("Test Token", "TEST", {
        from: account_one,
      });

      await this.contract.mint(account_two, 0, { from: account_one });
      await this.contract.mint(account_two, 1, { from: account_one });
    });

    it("should return total supply", async function () {
      const totalSupply = await this.contract.totalSupply.call();
      assert.equal(totalSupply.toNumber(), 2, "Total supply amount incorrect");
    });

    it("should get token balance", async function () {
      const ownerBalance = await this.contract.balanceOf.call(account_two);
      assert.equal(ownerBalance.toNumber(), 2, "Owner balance is incorrect");
    });

    // token uri should be complete i.e: https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/1
    it("should return token uri", async function () {
      const tokenURI = await this.contract.tokenURI(1);
      assert.equal(
        tokenURI,
        "https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/1"
      );
    });

    it("should transfer token from one owner to another", async function () {
      await this.contract.transferFrom(account_two, account_one, 1, {
        from: account_two,
      });
      const owner = await this.contract.ownerOf(1);
      assert.equal(owner, account_one, "Token owner should be new account");
    });
  });

  describe("have ownership properties", function () {
    beforeEach(async function () {
      this.contract = await ERC721Mintable.new("Test Token", "TEST", {
        from: account_one,
      });
    });

    it("should fail when minting when address is not contract owner", async function () {
      let reverted = false;
      try {
        await this.contract.mint(account_two, 2, { from: account_two });
      } catch (e) {
        reverted = true;
      }
      assert.equal(reverted, true, "Minting was allowed fomr non owner");
    });

    it("should return contract owner", async function () {
      const owner = await this.contract.owner();
      assert.equal(owner, account_one, "Contract owner incorrect");
    });
  });
});
