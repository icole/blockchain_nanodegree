var Test = require("../config/testConfig.js");
var BigNumber = require("bignumber.js");
var truffleAssert = require("truffle-assertions");
const { SingleEntryPlugin } = require("webpack");

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

  it("(airline) cannot register another Airline if it is not funded", async () => {
    // ARRANGE
    let unfundedAirline = accounts[2];
    let newAirline = accounts[3];
    let isRegisteredAirline = await config.flightSuretyData.isRegisteredAirline(
      unfundedAirline
    );
    if (!isRegisteredAirline) {
      await config.flightSuretyApp.registerAirline(
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

  it("(airline) cannot be funded with less than 10 ETH", async () => {
    // ARRANGE
    let unfundedAirline = accounts[2];
    let reverted = false;

    // ACT
    try {
      await config.flightSuretyApp.fundAirline.call({
        from: unfundedAirline,
        value: web3.utils.toWei("1", "ether"),
      });
    } catch (e) {
      reverted = true;
    }

    // ASSERT
    assert.equal(reverted, true, "Airline funding should thow an error");
    let airlineFunded = await config.flightSuretyApp.isFundedAirline.call(
      unfundedAirline
    );
    assert.equal(airlineFunded, false, "Airline should not be funded");
  });

  it("(airline) can be funded with 10 ETH", async () => {
    // ARRANGE
    let unfundedAirline = accounts[2];

    // ACT
    let tx = await config.flightSuretyApp.fundAirline({
      from: unfundedAirline,
      value: web3.utils.toWei("10", "ether"),
    });

    // ASSERT
    // Watch the emitted event AirlineFunded()
    truffleAssert.eventEmitted(tx, "AirlineFunded", (ev) => {
      return ev.airlineAddress == unfundedAirline && ev.isFunded == true;
    });
    let airlineFunded = await config.flightSuretyApp.isFundedAirline.call(
      unfundedAirline
    );
    assert.equal(airlineFunded, true, "Airline should be funded");
  });

  it("(airline) can register another Airline after it is funded", async () => {
    // ARRANGE
    let fundedAirline = accounts[2];
    let airlineFunded = await config.flightSuretyApp.isFundedAirline.call(
      fundedAirline
    );
    assert.equal(airlineFunded, true, "Airline should be funded");

    let unregisteredAirline = accounts[3];
    isRegisteredAirline = await config.flightSuretyData.isRegisteredAirline(
      unregisteredAirline
    );
    assert.equal(
      isRegisteredAirline,
      false,
      "Airline should not be registered"
    );

    // ACT
    let tx = await config.flightSuretyApp.registerAirline(
      unregisteredAirline,
      "Foo Fighter Airlines",
      {
        from: fundedAirline,
      }
    );

    // ASSERT
    // Watch the emitted event AirlineRegistered()
    truffleAssert.eventEmitted(tx, "AirlineRegistered", (ev) => {
      return (
        ev.airlineAddress == unregisteredAirline && ev.isRegistered == true
      );
    });
    let airlineRegistered =
      await config.flightSuretyApp.isRegisteredAirline.call(
        unregisteredAirline
      );
    assert.equal(airlineRegistered, true, "Airline should be registered");
  });

  it("(airline) cannot register an already registered Airline", async () => {
    // ARRANGE
    let reverted = false;
    let fundedAirline = accounts[2];
    let airlineFunded = await config.flightSuretyApp.isFundedAirline.call(
      fundedAirline
    );
    assert.equal(airlineFunded, true, "Airline should be funded");

    let registeredAirline = accounts[3];
    isRegisteredAirline = await config.flightSuretyData.isRegisteredAirline(
      registeredAirline
    );
    assert.equal(isRegisteredAirline, true, "Airline should be registered");

    // ACT
    try {
      await config.flightSuretyApp.registerAirline.call(
        registeredAirline,
        "Foo Fighter Airlines",
        {
          from: fundedAirline,
        }
      );
    } catch (e) {
      reverted = true;
    }

    // ASSERT
    assert.equal(reverted, true, "Registered should throw an error");
  });

  it("(airline) cannot be funded if it is not registered", async () => {
    // ARRANGE
    let unregisteredAirline = accounts[4];
    let isRegisteredAirline = await config.flightSuretyData.isRegisteredAirline(
      unregisteredAirline
    );
    assert.equal(
      isRegisteredAirline,
      false,
      "Airline should not be registered"
    );

    // ACT
    let tx = await config.flightSuretyApp.fundAirline({
      from: unregisteredAirline,
      value: web3.utils.toWei("10", "ether"),
    });

    // ASSERT
    // Watch the emitted event AirlineFunded()
    truffleAssert.eventNotEmitted(tx, "AirlineFunded", (ev) => {
      return ev.airlineAddress == unregisteredAirline && ev.isFunded == true;
    });
    let airlineFunded = await config.flightSuretyApp.isFundedAirline.call(
      unregisteredAirline
    );
    assert.equal(airlineFunded, false, "Airline should not be funded");
  });

  it("(airline) requires 50% registration votes after 4 registered airlines", async () => {
    // ARRANGE
    let airline, isRegisteredAirline, isFundedAirline, registreredAirlineCount;
    let response;
    for (let i = 1; i < 5; i++) {
      airline = accounts[i];
      isRegisteredAirline = await config.flightSuretyData.isRegisteredAirline(
        airline
      );
      if (!isRegisteredAirline) {
        await config.flightSuretyApp.registerAirline.call(
          airline,
          `Foo Fighter Airlines ${i}`,
          {
            from: config.owner,
          }
        );
        isRegisteredAirline = await config.flightSuretyData.isRegisteredAirline(
          airline
        );
      }
      registreredAirlineCount =
        await config.flightSuretyData.registeredAirlineCount();
      console.log(registreredAirlineCount);

      isFundedAirline = await config.flightSuretyData.isFundedAirline(airline);
      if (!isFundedAirline) {
        await config.flightSuretyApp.fundAirline.call({
          from: airline,
          value: web3.utils.toWei("10", "ether"),
        });
      }
    }
    let fundedAirlineCount = await config.flightSuretyData.fundedAirlineCount();
    assert.equal(fundedAirlineCount, 5, "There should be 4 Airlines");

    // ACT
    let tx = await config.flightSuretyApp.fundAirline({
      from: unregisteredAirline,
      value: web3.utils.toWei("10", "ether"),
    });

    // ASSERT
    // Watch the emitted event AirlineFunded()
    truffleAssert.eventNotEmitted(tx, "AirlineFunded", (ev) => {
      return ev.airlineAddress == unregisteredAirline && ev.isFunded == true;
    });
    let airlineFunded = await config.flightSuretyApp.isFundedAirline.call(
      unregisteredAirline
    );
    assert.equal(airlineFunded, false, "Airline should not be funded");
  });
});
