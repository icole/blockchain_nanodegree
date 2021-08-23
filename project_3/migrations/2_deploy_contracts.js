// migrating the appropriate contracts
var SupplyChain = artifacts.require("./SupplyChain.sol");

module.exports = async function (deployer, network, accounts) {
  const ownerID = accounts[0];
  const originFarmerID = accounts[1];
  const distributorID = accounts[2];
  const retailerID = accounts[3];
  const consumerID = accounts[4];

  await deployer.deploy(SupplyChain, { from: ownerID });

  // Authorize accounts
  const supplyChain = await SupplyChain.deployed();
  await supplyChain.addFarmer(originFarmerID);
  await supplyChain.addDistributor(distributorID);
  await supplyChain.addRetailer(retailerID);
  await supplyChain.addConsumer(consumerID);
};
