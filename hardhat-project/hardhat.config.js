require('@nomicfoundation/hardhat-toolbox')
require('dotenv').config()

const { RPC_URL, PRIVATE_KEY } = process.env

if (!RPC_URL) {
  console.error('Error: RPC_URL is not defined in .env file')
  process.exit(1)
}

if (!PRIVATE_KEY || PRIVATE_KEY.length !== 64) {
  console.error('Error: PRIVATE_KEY is not valid or not defined in .env file')
  process.exit(1)
}

module.exports = {
  solidity: '0.8.27',
  networks: {
    geth: {
      url: RPC_URL, // Đọc từ file .env
      accounts: [`0x${PRIVATE_KEY}`] // Private key từ file .env
    }
  }
}
