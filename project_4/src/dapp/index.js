import DOM from "./dom";
import Contract from "./contract";
import "./flightsurety.css";

(async () => {
  let result = null;

  let contract = new Contract("localhost", () => {
    // Read transaction
    contract.isOperational((error, result) => {
      console.log(error, result);
      display("Operational Status", "Check if contract is operational", [
        { label: "Operational Status", error: error, value: result },
      ]);
    });

    DOM.elid("register-airline").addEventListener("click", () => {
      let airline = DOM.elid("airline-address").value;
      let [airlineAddress, airlineName] = airline.split(",");

      contract.registerAirline(airlineAddress, airlineName, (error, result) => {
        display("Airline", "Registration", [
          {
            label: "Registration Details",
            error: error?.message,
            value: `Result: ${result}`,
          },
        ]);
      });
    });

    DOM.elid("find-airline").addEventListener("click", () => {
      let airline = DOM.elid("airline-address").value;
      let [airlineAddress, airlineName] = airline.split(",");

      contract.getAirlineDetails(airlineAddress, (error, result) => {
        display("Airline", `Details For: ${airlineName}`, [
          {
            label: "Status Details",
            error: error,
            value: `Registered: ${result?.isRegistered || false}, Funded: ${
              result?.isFunded || false
            }`,
          },
        ]);
      });
    });

    // User-submitted transaction
    DOM.elid("submit-oracle").addEventListener("click", () => {
      let flight = DOM.elid("flight-number").value;
      let [airline, flightNumber, timestamp] = flight.split(",");

      // Write transaction
      contract.fetchFlightStatus(
        airline,
        flightNumber,
        timestamp,
        (error, result) => {
          display("Oracles", "Trigger oracles", [
            {
              label: "Fetch Flight Status",
              error: error?.message,
              value: result.flight + " " + result.timestamp,
            },
          ]);
        }
      );
    });

    DOM.elid("find-flight").addEventListener("click", () => {
      let flight = DOM.elid("flight-number").value;
      let [airline, flightNumber, timestamp] = flight.split(",");
      console.log(airline, flightNumber, timestamp);

      contract.getFlightDetails(
        airline,
        flightNumber,
        timestamp,
        (error, result) => {
          display("Flight", `Details For: ${flight}`, [
            {
              label: "Status Details",
              error: error,
              value: `Registered: ${
                result?.isRegistered || false
              }, Status Code: ${result?.statusCode}`,
            },
          ]);
        }
      );
    });

    DOM.elid("register-flight").addEventListener("click", () => {
      let flight = DOM.elid("flight-number").value;
      let [airline, flightNumber, timestamp] = flight.split(",");
      console.log(airline, flightNumber, timestamp);

      contract.registerFlight(
        airline,
        flightNumber,
        timestamp,
        (error, result, payload) => {
          display("Flight", "Registration", [
            {
              label: "Registration Details",
              error: error?.message,
              value: `Tx: ${result}, Airline: ${payload.airline}, Flight: ${payload.flight}, Timestamp: ${payload.timestamp}`,
            },
          ]);
        }
      );
    });
  });
})();

function display(title, description, results) {
  let displayDiv = DOM.elid("display-wrapper");
  let section = DOM.section();
  section.appendChild(DOM.h2(title));
  section.appendChild(DOM.h5(description));
  results.map((result) => {
    let row = section.appendChild(DOM.div({ className: "row" }));
    row.appendChild(DOM.div({ className: "col-sm-4 field" }, result.label));
    row.appendChild(
      DOM.div(
        { className: "col-sm-8 field-value" },
        result.error ? String(result.error) : String(result.value)
      )
    );
    section.appendChild(row);
  });
  displayDiv.prepend(section);
}
