import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const POLYGON_AMOY_RPC = process.env.POLYGON_AMOY_RPC || "";
const RELAYER_PRIVATE_KEY = process.env.RELAYER_PRIVATE_KEY || "";
const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY || "";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },

  networks: {
    hardhat: {},
    amoy: {
      url: POLYGON_AMOY_RPC,
      accounts: RELAYER_PRIVATE_KEY ? [RELAYER_PRIVATE_KEY] : [],
      chainId: 80002,
    },
  },

  // Etherscan V2 — single API key for all chains
  etherscan: {
    apiKey: POLYGONSCAN_API_KEY,
  },

  gasReporter: {
    enabled: true,
    currency: "USD",
  },
};

export default config;
