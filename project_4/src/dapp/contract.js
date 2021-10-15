import FlightSuretyApp from "../../build/contracts/FlightSuretyApp.json";
import Config from "./config.json";
import Web3 from "web3";

export default class Contract {
  constructor(network, callback) {
    this.initialize(callback);
    this.owner = null;
    this.flights = [
      {
        airlineAddress: "0xf17f52151EbEF6C7334FAD080c5704D77216b732",
        airlineName: "American Airlines",
        number: "AA123",
        timestamp: "1634745600",
      },
      {
        airlineAddress: "0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef",
        airlineName: "Delta Airlines",
        number: "DAL4343",
        timestamp: "1634846400",
      },
      {
        airlineAddress: "0x821aEa9a577a9b44299B9c15c88cf3087F3b5544",
        airlineName: "British Airlines",
        number: "BA56",
        timestamp: "1634936400",
      },
      {
        airlineAddress: "0x0d1d4e623D10F9FBA5Db95830F7d3839406C6AF2",
        airlineName: "Alaska Airlines",
        number: "AS654",
        timestamp: "1634947200",
      },
      {
        airlineAddress: "0x2932b7A2355D6fecc4b5c0B6BD44cC31df247a2e",
        airlineName: "Southwest",
        number: "WN2256",
        timestamp: "1635748200",
      },
    ];
    this.airlines = [
      {
        address: "0xf17f52151EbEF6C7334FAD080c5704D77216b732",
        name: "American Airlines",
      },
      {
        address: "0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef",
        name: "Delta Airlines",
      },
      {
        address: "0x821aEa9a577a9b44299B9c15c88cf3087F3b5544",
        name: "British Airways",
      },
      {
        address: "0x0d1d4e623D10F9FBA5Db95830F7d3839406C6AF2",
        name: "Alaska Airlines",
      },
      {
        address: "0x2932b7A2355D6fecc4b5c0B6BD44cC31df247a2e",
        name: "Southwest",
      },
    ];
    this.passengers = [
      "0x2191eF87E392377ec08E7c08Eb105Ef5448eCED5",
      "0x0F4F2Ac550A1b4e2280d04c21cEa7EBD822934b5",
    ];
  }

  async initialize(callback) {
    let config = Config["localhost"];
    if (typeof web3 !== "undefined") {
      console.log("Using web3 detected from external source like Metamask");
      this.web3 = new Web3(web3.currentProvider);
    } else {
      console.log("No web3 detected. Falling back to http://localhost:8545");
      this.web3 = new Web3(new Web3.providers.HttpProvider(config.url));
    }
    const accounts = await this.web3.eth.getAccounts();
    this.flightSuretyApp = new this.web3.eth.Contract(
      FlightSuretyApp.abi,
      config.appAddress
    );
    this.currentAccount = accounts[0];
    console.log("Account", this.currentAccount);
    console.log("Contract Address", config.appAddress);

    const airlineSelect = document.getElementById("airline-address");
    const flightSelect = document.getElementById("flight-number");
    const passengerSelect = document.getElementById("passenger-address");

    this.airlines.forEach((airline) => {
      airlineSelect.options[airlineSelect.options.length] = new Option(
        `${airline["address"]} - ${airline["name"]}`,
        `${airline["address"]},${airline["name"]}`
      );
    });

    this.flights.forEach((flight) => {
      flightSelect.options[flightSelect.options.length] = new Option(
        `${flight["airlineName"]} - ${flight["number"]} - ${new Date(
          flight["timestamp"] * 1000
        )
          .toISOString()
          .replace(/z|t/gi, " ")
          .trim()}`,
        `${flight["airlineAddress"]},${flight["number"]},${flight["timestamp"]}`
      );
    });

    this.passengers.forEach((passengerAddress) => {
      passengerSelect.options[passengerSelect.options.length] = new Option(
        passengerAddress,
        passengerAddress
      );
      this.passengers.push(passengerAddress);
    });

    callback();
  }

  isOperational(callback) {
    let self = this;
    self.flightSuretyApp.methods
      .isOperational()
      .call({ from: self.owner }, callback);
  }

  async getAirlineDetails(airline, callback) {
    let self = this;
    console.log(airline);
    self.flightSuretyApp.methods
      .getAirlineDetails(airline)
      .call(
        { from: this.currentAccount, gasLimit: 999999999 },
        (error, result) => {
          callback(error, result);
        }
      );
  }

  registerAirline(airlineAddress, airlineName, callback) {
    let self = this;
    self.flightSuretyApp.methods
      .registerAirline(airlineAddress, airlineName)
      .send(
        { from: this.currentAccount, gasLimit: 999999999 },
        (error, result) => {
          callback(error, result);
        }
      );
  }

  fetchFlightStatus(airline, flight, timestamp, callback) {
    let self = this;
    let payload = {
      airline: airline,
      flight: flight,
      timestamp: timestamp,
    };
    self.flightSuretyApp.methods
      .fetchFlightStatus(payload.airline, payload.flight, payload.timestamp)
      .send({ from: this.currentAccount }, (error, result) => {
        callback(error, payload);
      });
  }

  registerFlight(airline, flight, timestamp, callback) {
    let self = this;
    let payload = {
      airline: airline,
      flight: flight,
      timestamp: timestamp,
    };
    self.flightSuretyApp.methods
      .registerFlight(payload.flight, payload.timestamp)
      .send(
        { from: this.currentAccount, gasLimit: 999999999 },
        (error, result) => {
          callback(error, result, payload);
        }
      );
  }

  getFlightDetails(airline, flight, timestamp, callback) {
    let self = this;
    self.flightSuretyApp.methods
      .getFlightDetails(airline, flight, timestamp)
      .call(
        { from: this.currentAccount, gasLimit: 999999999 },
        (error, result) => {
          callback(error, result);
        }
      );
  }
}
