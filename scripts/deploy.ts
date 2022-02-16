// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import hardhat, { ethers } from 'hardhat'
import args from '../arguments-testnet'
import * as dotenv from 'dotenv'
dotenv.config()

async function main() {
  const CakeToken = await ethers.getContractFactory('CakeToken')
  const cakeToken = await CakeToken.deploy(
    args[0],
    args[1],
    args[2],
    args[3],
    args[4],
    args[5],
  )
  await cakeToken.deployed()

  const SyrupBar = await ethers.getContractFactory('SyrupBar')
  const syrupBar = await SyrupBar.deploy(cakeToken.address)
  await syrupBar.deployed()

  const MasterChef = await ethers.getContractFactory('MasterChef')
  const masterChef = await MasterChef.deploy(
    cakeToken.address,
    syrupBar.address,
    process.env.DEV_ADDR,
    10,
    0,
  )
  masterChef.deployed()

  const networkName = hardhat.network.name
  switch (networkName) {
    case 'rinkeby':
      console.log(
        `Token deployed to: https://rinkeby.etherscan.io/address/${cakeToken.address}#code`,
      )
      break
    case 'bscTestnet':
      console.log(
        `Token deployed to: https://testnet.bscscan.com/address/${cakeToken.address}#code`,
      )
      console.log(
        `SyrupBar deployed to: https://testnet.bscscan.com/address/${syrupBar.address}#code`,
      )
      console.log(
        `MasterChef deployed to: https://testnet.bscscan.com/address/${masterChef.address}#code`,
      )
      break
    case 'bsc':
      console.log(
        `Token deployed to: https://bscscan.com/address/${cakeToken.address}#code`,
      )
      break
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
