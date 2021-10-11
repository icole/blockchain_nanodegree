var Test = require("../config/testConfig.js");
var BigNumber = require("bignumber.js");

contract("Flight Surety Tests", async (accounts) => {
  var config;
  before("setup contract", async () => {
    config = await Test.Config(accounts);
  });

  /****************************************************************************************/
  /* Operations and Settings                                                              */
  /****************************************************************************************/

  it(`(multiparty) has correct initial isOperational() value`, async function () {
    // Get operating status
    let status = await config.flightSuretyData.isOperational.call();
    assert.equal(status, true, "Incorrect initial operating status value");
  });

  it(`(multiparty) can block access to setOperatingStatus() for non-Contract Owner account`, async function () {
    // Ensure that access is denied for non-Contract Owner account
    let accessDenied = false;
    try {
      await config.flightSuretyData.setOperatingStatus.call(false, {
        from: config.firstAirline,
      });
    } catch (e) {
      accessDenied = true;
    }
    assert.equal(accessDenied, true, "Access not restricted to Contract Owner");
  });

  it(`(multiparty) can allow access to setOperatingStatus() for Contract Owner account`, async function () {
    // Ensure that access is allowed for Contract Owner account
    let accessDenied = false;
    try {
      await config.flightSuretyData.setOperatingStatus(false);
    } catch (e) {
      accessDenied = true;
    }
    assert.equal(
      accessDenied,
      false,
      "Access not restricted to Contract Owner"
    );
  });

  it(`(multiparty) can block access to functions using requireIsOperational when operating status is false`, async function () {
    await config.flightSuretyData.setOperatingStatus(false);

    let reverted = false;
    try {
      await config.flightSurety.setTestingMode(true);
    } catch (e) {
      reverted = true;
    }
    assert.equal(reverted, true, "Access not blocked for requireIsOperational");

    // Set it back for other tests to work
    await config.flightSuretyData.setOperatingStatus(true);
  });

  it("(airline) contract owner can register first airline", async () => {
    await config.flightSuretyApp.registerAirline(
      config.firstAirline,
      "Test Airline",
      {
        from: config.owner,
      }
    );
    let result = await config.flightSuretyData.isRegisteredAirline(
      config.firstAirline
    );

    // ASSERT
    assert.equal(result, true, "First airline should be found");
  });

  it("(airline) cannot register an Airline using registerAirline() if it is not funded", async () => {
    // ARRANGE
    let unfundedAirline = accounts[2];
    let newAirline = accounts[3];
    let isRegisteredAirline = await config.flightSuretyData.isRegisteredAirline(
      unfundedAirline
    );
    if (!isRegisteredAirline) {
      let result = await config.flightSuretyApp.registerAirline(
        unfundedAirline,
        "Unfunded Airline",
        {
          from: config.owner,
        }
      );
      isRegisteredAirline = await config.flightSuretyData.isRegisteredAirline(
        unfundedAirline
      );
    }
    assert.equal(
      isRegisteredAirline,
      true,
      "Unfunded airline should be registered"
    );
    // ACT
    try {
      await config.flightSuretyApp.registerAirline(newAirline, "New Airline", {
        from: unfundedAirline,
      });
    } catch (e) {}

    // ASSERT
    let result = await config.flightSuretyData.isRegisteredAirline(newAirline);
    assert.equal(
      result,
      false,
      "Airline should not be able to register another airline if it hasn't provided funding"
    );
  });
});
