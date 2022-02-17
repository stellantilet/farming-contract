// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import * as dotenv from 'dotenv'
import fs from 'fs'
import hardhat, { ethers } from 'hardhat'
dotenv.config()

async function main() {
  // Token
  const CakeToken = await ethers.getContractFactory('CakeToken')
  const cakeTokenArgs = [
    50,
    100,
    1000,
    '0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3',
    [
      '0xae13d989dac2f0debff460ac112a837c89baa7cd', // WBNB
      '0x7ef95a0fee0dd31b22626fa2e10ee6a223f8a684', // USDT
      '0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee', // BUSD
    ],
  ]
  const cakeToken = await CakeToken.deploy(...cakeTokenArgs)
  await cakeToken.deployed()

  // SyrupBar
  const syrupBarArgs = [cakeToken.address]
  const SyrupBar = await ethers.getContractFactory('SyrupBar')
  const syrupBar = await SyrupBar.deploy(...syrupBarArgs)
  await syrupBar.deployed()

  // MasterChef
  const masterChefArgs = [
    cakeToken.address,
    syrupBar.address,
    process.env.DEV_ADDR,
    10,
    0,
  ]
  const MasterChef = await ethers.getContractFactory('MasterChef')
  const masterChef = await MasterChef.deploy(...masterChefArgs)
  masterChef.deployed()

  // Network
  const networkName = hardhat.network.name as 'rinkeby' | 'bscTestnet' | 'bsc'
  const scanURI = {
    rinkeby: 'https://rinkeby.etherscan.io',
    bscTestnet: 'https://testnet.bscscan.com',
    bsc: 'https://bscscan.com',
  }

  // Log deployment address
  console.log(
    `Token deployed to: ${scanURI[networkName]}/address/${cakeToken.address}#code`,
  )
  console.log(
    `SyrupBar deployed to: ${scanURI[networkName]}/address/${syrupBar.address}#code`,
  )
  console.log(
    `MasterChef deployed to: ${scanURI[networkName]}/address/${masterChef.address}#code`,
  )

  // Write the arguments
  await fs.writeFile(
    `./arguments/argument-token-${networkName}.ts`,
    `export default ${JSON.stringify(cakeTokenArgs)}`,
    (error) => {
      if (error) console.log(error)
    },
  )

  await fs.writeFile(
    `./arguments/argument-syrupbar-${networkName}.ts`,
    `export default ${JSON.stringify(syrupBarArgs)}`,
    (error) => {
      if (error) console.log(error)
    },
  )

  await fs.writeFile(
    `./arguments/argument-masterchef-${networkName}.ts`,
    `export default ${JSON.stringify(masterChefArgs)}`,
    (error) => {
      if (error) console.log(error)
    },
  )

  await fs.appendFile(
    `./deployed.log`,
    `
###### ${networkName} (${new Date()}) ######
Token: ${scanURI[networkName]}/address/${cakeToken.address}#code
SyrupBar: ${scanURI[networkName]}/address/${syrupBar.address}#code
MasterChef: ${scanURI[networkName]}/address/${masterChef.address}#code
    `,
    (error) => {
      if (error) console.log(error)
    },
  )
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
