import FlightSuretyApp from "../../build/contracts/FlightSuretyApp.json";
import Config from "./config.json";
import Web3 from "web3";

export default class Contract {
  constructor(network, callback) {
    let config = Config[network];
    this.web3 = new Web3(new Web3.providers.HttpProvider(config.url));
    this.flightSuretyApp = new this.web3.eth.Contract(
      FlightSuretyApp.abi,
      config.appAddress
    );
    this.initialize(callback);
    this.owner = null;
    this.flights = ["AA123", "DAL4343", "BA56", "AS654"];
    this.airlines = [];
    this.passengers = [];
  }

  initialize(callback) {
    this.web3.eth.getAccounts((error, accts) => {
      this.owner = accts[0];

      let counter = 1;
      let airlineAddress, passengerAddress;

      const airlineSelect = document.getElementById("airline-address");
      const flightSelect = document.getElementById("flight-number");
      const passengerSelect = document.getElementById("passenger-address");

      while (this.airlines.length < 5) {
        airlineAddress = accts[counter++];
        airlineSelect.options[airlineSelect.options.length] = new Option(
          airlineAddress,
          airlineAddress
        );
        this.airlines.push(airlineAddress);
      }

      this.flights.forEach((flight) => {
        flightSelect.options[flightSelect.options.length] = new Option(
          flight,
          flight
        );
      });

      while (this.passengers.length < 4) {
        passengerAddress = accts[counter++];
        passengerSelect.options[passengerSelect.options.length] = new Option(
          passengerAddress,
          passengerAddress
        );
        this.passengers.push(passengerAddress);
      }

      callback();
    });
  }

  isOperational(callback) {
    let self = this;
    self.flightSuretyApp.methods
      .isOperational()
      .call({ from: self.owner }, callback);
  }

  fetchFlightStatus(flight, callback) {
    let self = this;
    let payload = {
      airline: self.airlines[0],
      flight: flight,
      timestamp: Math.floor(Date.now() / 1000),
    };
    self.flightSuretyApp.methods
      .fetchFlightStatus(payload.airline, payload.flight, payload.timestamp)
      .send({ from: self.owner }, (error, result) => {
        callback(error, payload);
      });
  }

  registerFlight(flight, callback) {
    let self = this;
    let payload = {
      airline: self.airlines[0],
      flight: flight,
      timestamp: Math.floor(Date.now() / 1000),
    };
    self.flightSuretyApp.methods
      .registerFlight(payload.flight, payload.timestamp)
      .send({ from: payload.airline }, (error, result) => {
        callback(error, payload);
      });
  }

  getFlightDetails(flight, callback) {
    let self = this;
    self.flightSuretyApp.methods
      .getFlightDetails(self.airlines[0], flight)
      .call({ from: self.owner }, (error, result) => {
        callback(error, result);
      });
  }
}
