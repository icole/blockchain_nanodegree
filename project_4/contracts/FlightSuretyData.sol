/* SPDX-License-Identifier: MIT */
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract FlightSuretyData {
    using SafeMath for uint256;

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    address private contractOwner; // Account used to deploy contract
    address private appContractAddress; // App contract allows to interact
    bool private operational = true; // Blocks all state changes throughout the contract if false

    struct Airline {
        string name;
        bool isRegistered;
        bool isFunded;
    }

    struct Passenger {
        address passenger;
        uint amount;
    }

    mapping(address => Airline) private airlines; // All Airlines
    mapping(bytes32 => Passenger[]) private flightPassengers;
    mapping(address => uint) private passengerPayouts;

    address[] private registeredAirlines; // Registered Airlines;
    address[] private fundedAirlines; // Funded Airlines


    event PassengerCredited(
        address passenger,
        uint amount
    );

    /********************************************************************************************/
    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/

    /**
     * @dev Constructor
     *      The deploying account becomes contractOwner
     */
    constructor() {
        contractOwner = msg.sender;
    }

    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    // Modifiers help avoid duplication of code. They are typically used to validate something
    // before a function is allowed to be executed.

    /**
     * @dev Modifier that requires the "operational" boolean variable to be "true"
     *      This is used on all state changing functions to pause the contract in
     *      the event there is an issue that needs to be fixed
     */
    modifier requireIsOperational() {
        require(operational, "Contract is currently not operational");
        _; // All modifiers require an "_" which indicates where the function body will be added
    }

    /**
     * @dev Modifier that requires the "ContractOwner" account to be the function caller
     */
    modifier requireContractOwner() {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }

    /**
     * @dev Modifier that requires the caller to be pre-authorized app contract
     */
     modifier requireAppContract() {
         require(msg.sender == appContractAddress, "Caller is not app contract");
         _;
     }

    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    /**
     * @dev Get operating status of contract
     *
     * @return A bool that is the current operating status
     */
    function isOperational() public view returns (bool) {
        return operational;
    }

    /**
     * @dev Sets contract operations on/off
     *
     * When operational mode is disabled, all write transactions except for this one will fail
     */
    function setOperatingStatus(bool mode) external requireContractOwner {
        operational = mode;
    }

    /**
     * @dev Checks if a particular airline is regisered
     *
     * @return A bool that is whether the airline is registered or not
     */
    function isRegisteredAirline(address airline) public view returns (bool) {
        return airlines[airline].isRegistered;
    }

    /**
     * @dev Checks if a particular airline is funded
     *
     * @return A bool that is whether the airline is funded or not
     */
    function isFundedAirline(address airline) public view returns (bool) {
        return airlines[airline].isFunded;
    }

    /**
     * @dev Returns status fields for a particular Airline
     *
     * @return bool for registration and bool for funded
     */
    function getAirlineDetails(address airline) public view returns (bool, bool) {
        return (airlines[airline].isRegistered, airlines[airline].isFunded);
    }

    /**
     * @dev Sets the App contract address authorized to call this contract
     */
    function setAppContract(address _appContractAddress)
        external
        requireContractOwner
    {
        appContractAddress = _appContractAddress;
    }

    /**
     * @dev Returns count of funded Airlines
     */
    function fundedAirlineCount() public view returns (uint) {
        return fundedAirlines.length;
    }

    /**
     * @dev Returns count of registered Airlines
     */
    function registeredAirlineCount() public view returns (uint) {
        return registeredAirlines.length;
    }

    /**
     * @dev Returns amount pending for payout to passenger
     */
    function pendingPayout(address passenger) public view returns (uint) {
        return passengerPayouts[passenger];
    }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

    /**
     * @dev Add an airline to the registration queue
     *      Can only be called from FlightSuretyApp contract
     *
     */
    function registerAirline(address airlineAddress, string memory airlineName) external 
        requireIsOperational requireAppContract returns (bool)
    {
        Airline memory newAirline = Airline({
            name: airlineName,
            isRegistered: true,
            isFunded: false
        });
        airlines[airlineAddress] = newAirline;
        registeredAirlines.push(airlineAddress);
        return newAirline.isRegistered;
    }

    /**
     * @dev Fund a particular airline
     */
    function fundAirline(address airlineAddress) external 
        requireIsOperational requireAppContract payable returns (bool)
    {
        Airline memory airline = airlines[airlineAddress];
        airline.isFunded = true;
        airlines[airlineAddress] = airline;
        fundedAirlines.push(airlineAddress);
        return airline.isFunded;
    }

    /**
     * @dev Buy insurance for a flight
     *
     */
    function buy(bytes32 key, address passenger) external
        requireIsOperational requireAppContract payable
    {
        flightPassengers[key].push(Passenger({
            passenger: passenger,
            amount: msg.value
        }));
    }

    /**
     *  @dev Credits payouts to insurees
     */
    function creditInsurees(bytes32 key) external
        requireIsOperational requireAppContract 
    {
        Passenger[] memory passengers = flightPassengers[key];
        for (uint i=0; i<passengers.length; i++) {
            address passenger = passengers[i].passenger;
            uint payoutAmount = passengers[i].amount * 3 / 2;
            passengerPayouts[passengers[i].passenger] += payoutAmount;
            emit PassengerCredited(passenger, payoutAmount);
        }
    }

    /**
     *  @dev Transfers eligible payout funds to insuree
     *
     */
    function pay(address payable passenger) external
        requireIsOperational requireAppContract
    {
        uint payoutAmount = passengerPayouts[passenger];
        passengerPayouts[passenger] = 0;
        passenger.transfer(payoutAmount);
    }

    /**
     * @dev Initial funding for the insurance. Unless there are too many delayed flights
     *      resulting in insurance payouts, the contract should be self-sustaining
     *
     */
    function fund() public payable {}

    function getFlightKey(
        address airline,
        string memory flight,
        uint256 timestamp
    ) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    /**
     * @dev Fallback function for funding smart contract.
     *
     */
    fallback() external payable {
        fund();
    }

    receive() external payable {
        fund();
    }
}
