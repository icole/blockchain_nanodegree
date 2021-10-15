//import FlightSuretyApp from "../../build/contracts/FlightSuretyApp.json";
import Config from "./config.json";
import Web3 from "web3";
import express from "express";
import contract from "@truffle/contract";
import fs from "fs";

let config = Config["localhost"];
let provider = new Web3.providers.WebsocketProvider(
  config.url.replace("http", "ws")
);
let web3 = new Web3(provider);
let FlightSuretyApp = contract(
  JSON.parse(fs.readFileSync("build/contracts/FlightSuretyApp.json"))
);

FlightSuretyApp.setProvider(provider);

async function registerOracles(oracleAccounts = []) {
  let flightSuretyApp = await FlightSuretyApp.deployed();
  let fee = await flightSuretyApp.REGISTRATION_FEE.call();
  let account;
  for (let i = 0; i < oracleAccounts.length; i++) {
    account = oracleAccounts[i];
    await flightSuretyApp.registerOracle({
      from: account,
      value: fee,
    });
    console.log(`Registered Oracle ${account}`);
  }
}

async function storeOracleIndexes(oracleAccounts = []) {
  let flightSuretyApp = await FlightSuretyApp.deployed();
  let indexes, indexAccounts, account;
  let indexesToAccounts = {};
  for (let i = 0; i < oracleAccounts.length; i++) {
    account = oracleAccounts[i];

    indexes = await flightSuretyApp.getMyIndexes.call({ from: account });
    indexes = indexes.map((index) => index.toNumber());
    indexes.forEach((index) => {
      indexAccounts = indexesToAccounts[index] || [];
      indexAccounts.push(account);
      indexesToAccounts[index] = indexAccounts;
    });

    console.log("Stored Oracle Indexes", account, indexes);
  }
  return indexesToAccounts;
}

async function setupOracles() {
  let flightSuretyApp = await FlightSuretyApp.deployed();
  let accounts = await web3.eth.getAccounts();
  // Use all accounts after for the first 10 reserved for Airlines / Passengers
  let oracleAccounts = accounts.slice(10, 20);

  await registerOracles(oracleAccounts);
  let indexesToAccounts = await storeOracleIndexes(oracleAccounts);
  console.log("Indexes To Accounts", indexesToAccounts);

  const requestEvent = flightSuretyApp.OracleRequest({
    fromBlock: 0,
  });

  let requestedOracles,
    index,
    airline,
    flight,
    timestamp,
    randomStatus,
    submitResponse;
  let flightStatuses = [0, 10, 20, 30, 40, 50];
  requestEvent.on("data", (result) => {
    index = result.args.index.toString();
    airline = result.args.airline;
    flight = result.args.flight;
    timestamp = result.args.timestamp.toString();
    requestedOracles = indexesToAccounts[index];
    console.log("Request:", index, airline, flight, timestamp);
    console.log(`Found ${requestedOracles.length} matching Oracles`);
    requestedOracles.forEach(async (oracle) => {
      //randomStatus =
      //  flightStatuses[Math.floor(Math.random() * flightStatuses.length)];
      randomStatus = 20;
      try {
        submitResponse = await flightSuretyApp.submitOracleResponse(
          index,
          airline,
          flight,
          timestamp,
          randomStatus,
          {
            from: oracle,
          }
        );
      } catch (e) {
        console.log(`Oracle Failed: ${oracle}`);
        console.log(e.message);
      }
      console.log(
        `Submitted Oracle Status: ${randomStatus} Tx: ${submitResponse}`
      );
    });
  });
}

setupOracles();

const app = express();
app.get("/api", (req, res) => {
  res.send({
    message: "An API for use with your Dapp!",
  });
});

export default app;
