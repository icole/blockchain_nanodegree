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

async function registerOracles() {
  let flightSuretyApp = await FlightSuretyApp.deployed();
  let accounts = await web3.eth.getAccounts();
  // Use all accounts after for the first 10 reserved for Airlines / Passengers
  let oracleAccounts = accounts.slice(10, 12);
  let fee = await flightSuretyApp.REGISTRATION_FEE.call();

  let indexes;
  oracleAccounts.forEach(async (account) => {
    await flightSuretyApp.registerOracle({
      from: account,
      value: fee,
    });
    indexes = await flightSuretyApp.getMyIndexes.call({
      from: account,
    });
    console.log(
      `Oracle Registered: ${indexes[0]}, ${indexes[1]}, ${indexes[2]}`
    );
  });

  const requestEvent = flightSuretyApp.OracleRequest({
    fromBlock: 0,
  });
  requestEvent.on("data", (result) => {
    console.log(result.args.index.toString());
  });
}

registerOracles();

const app = express();
app.get("/api", (req, res) => {
  res.send({
    message: "An API for use with your Dapp!",
  });
});

export default app;
