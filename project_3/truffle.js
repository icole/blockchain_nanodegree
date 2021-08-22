module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*", // Match any network id
      gas: 9999999,
    },
  },
  compilers: {
    solc: {
      version: "^0.5.17",
      settings: {
        optimizer: {
          enabled: true,
        },
      },
    },
  },
};
