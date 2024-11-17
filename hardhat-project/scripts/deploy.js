const hre = require('hardhat')

async function main() {
  try {
    // Lấy contract factory
    console.log('Fetching contract factory...')
    const CertificateStorage = await hre.ethers.getContractFactory(
      'CertificateStorage'
    )

    // Deploy contract
    console.log('Deploying contract...')
    const certificateStorage = await CertificateStorage.deploy()

    // Chờ giao dịch hoàn tất
    console.log('Waiting for contract to be deployed...')
    await certificateStorage.waitForDeployment()

    // Log địa chỉ contract
    const contractAddress = await certificateStorage.getAddress()
    console.log('CertificateStorage deployed to:', contractAddress)
  } catch (error) {
    console.error('Error during deployment:', error)
    process.exit(1)
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
// npx hardhat run scripts/deploy.js --network geth
