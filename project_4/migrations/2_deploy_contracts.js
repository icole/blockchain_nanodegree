const FlightSuretyApp = artifacts.require("FlightSuretyApp");
const FlightSuretyData = artifacts.require("FlightSuretyData");
const fs = require("fs");
const web3 = require("web3");

module.exports = async function (deployer, network, accounts) {
  const contractOwner = accounts[0];
  const firstAirlineAddress = accounts[1];
  const firstAirlineName = "Test Airline";
  await deployer.deploy(FlightSuretyData, { from: contractOwner });
  await deployer.deploy(FlightSuretyApp, FlightSuretyData.address, {
    from: contractOwner,
  });
  const data = await FlightSuretyData.deployed();
  const app = await FlightSuretyApp.deployed();

  // Authorize App Contract to interact with Data Contract
  await data.setAppContract(FlightSuretyApp.address, {
    from: contractOwner,
  });

  // Register First Airline
  // await app.registerAirline(firstAirlineAddress, firstAirlineName, {
  //   from: contractOwner,
  // });
  // await app.fundAirline({
  //   from: firstAirlineAddress,
  //   value: web3.utils.toWei("10", "ether"),
  // });

  // Store addresses in config file
  let config = {
    localhost: {
      url: "http://localhost:8545",
      dataAddress: FlightSuretyData.address,
      appAddress: FlightSuretyApp.address,
    },
  };
  fs.writeFileSync(
    __dirname + "/../src/dapp/config.json",
    JSON.stringify(config, null, "\t"),
    "utf-8"
  );
  fs.writeFileSync(
    __dirname + "/../src/server/config.json",
    JSON.stringify(config, null, "\t"),
    "utf-8"
  );
};
