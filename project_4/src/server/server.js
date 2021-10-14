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
  let indexes, indexAccounts, account;
  let indexesToAccounts = {};
  for (let i = 0; i < oracleAccounts.length; i++) {
    account = oracleAccounts[i];
    indexes = await flightSuretyApp.registerOracle.call({
      from: account,
      value: fee,
    });
    indexes.forEach((index) => {
      index = index.toNumber();
      indexAccounts = indexesToAccounts[index] || [];
      indexAccounts.push(account);
      indexesToAccounts[index] = indexAccounts;
    });
  }
  return indexesToAccounts;
}

async function setupOracles() {
  let flightSuretyApp = await FlightSuretyApp.deployed();
  let accounts = await web3.eth.getAccounts();
  // Use all accounts after for the first 10 reserved for Airlines / Passengers
  let oracleAccounts = accounts.slice(10, -1);

  let indexesToAccounts = await registerOracles(oracleAccounts);

  const requestEvent = flightSuretyApp.OracleRequest({
    fromBlock: 0,
  });

  let requestedOracles, requestedIndex;
  requestEvent.on("data", (result) => {
    requestedIndex = result.args.index.toString();
    requestedOracles = indexesToAccounts[requestedIndex];
    console.log(`Requested Index: ${requestedIndex}`);
    console.log(`Found oracles: ${requestedOracles.length}`);
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
