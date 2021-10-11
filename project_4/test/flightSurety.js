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
      await config.flightSuretyData.setOperatingStatus(false, {
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

  it("(airline) first airline is registered after deploy", async () => {
    let result = await config.flightSuretyData.isAirline(config.firstAirline);

    // ASSERT
    assert.equal(result, true, "First airline should be found");
  });

  it("(airline) first airline can register a new one", async () => {
    // ARRANGE
    let newAirline = accounts[2];

    // ACT
    let registerResult = await config.flightSuretyApp.registerAirline(
      newAirline,
      {
        from: config.firstAirline,
      }
    );
    let result = await config.flightSuretyData.isAirline(newAirline);

    // ASSERT
    assert.equal(result, true, "New registered airline should be found");
  });

  it("(airline) cannot register an Airline using registerAirline() if it is not funded", async () => {
    // ARRANGE
    let unfundedAirline = accounts[2];
    let newAirline = accounts[3];
    let isAirline = await config.flightSuretyData.isAirline(unfundedAirline);
    if (!isAirline) {
      await config.flightSuretyApp.registerAirline(unfundedAirline, {
        from: config.firstAirline,
      });
      isAirline = await config.flightSuretyData.isAirline(unfundedAirline);
    }
    assert.equal(isAirline, true, "Unfunded airline should be registered");

    //await config.flightSuretyApp.registerAirline(undfundedAirline);

    // ACT
    try {
      await config.flightSuretyApp.registerAirline(newAirline, {
        from: unfundedAirline,
      });
    } catch (e) {}
    let result = await config.flightSuretyData.isAirline.call(newAirline);

    // ASSERT
    assert.equal(
      result,
      false,
      "Airline should not be able to register another airline if it hasn't provided funding"
    );
  });
});
