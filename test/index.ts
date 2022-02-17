import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'
import {
  Contract,
  ContractReceipt,
  ContractTransaction,
} from 'ethers'
import { ethers } from 'hardhat'

describe('CakeToken', () => {
  let accounts: SignerWithAddress[]
  let CakeToken
  let cakeToken: Contract

  it('deploy', async () => {
    accounts = await ethers.getSigners()
    const [owner, addr1, addr2, addr3, addr4] = accounts
    CakeToken = await ethers.getContractFactory('CakeToken')
    cakeToken = await CakeToken.deploy(
      100,
      50,
      1000,
      '0x0000000000000000000000000000000000000000',
      [addr2.address, addr3.address],
    )
    await cakeToken.deployed()
  })

  it('mint', async () => {
    const [owner, addr1, addr2] = accounts
    let tx: ContractTransaction = await cakeToken
      .connect(owner)
      ['mint(address,uint256)'](addr1.address, 1000)
    expect((await cakeToken.balanceOf(addr1.address)).toString()).to.equal(
      '1000',
    )
    let receipt: ContractReceipt = await tx.wait()
    const events = receipt.events?.filter((x) => {
      return x.event == 'Transfer'
    })
    if (events && events.length > 0) {
      const e = events[0]
      expect((e.args && e.args[2]).toString()).to.equal('1000')
    }
  })

  it('transfer', async () => {
    const [owner, addr1, addr2] = accounts
    let tx: ContractTransaction = await cakeToken
      .connect(addr1)
      .transfer(addr2.address, 1000)
    expect((await cakeToken.balanceOf(addr1.address)).toString()).to.equal('0')
    expect((await cakeToken.balanceOf(addr2.address)).toString()).to.equal(
      '950',
    )
    let receipt: ContractReceipt = await tx.wait()
    const events = receipt.events?.filter((x) => {
      return x.event == 'Transfer'
    })
    if (events && events.length > 0) {
      const e = events[0]
      expect((e.args && e.args[2]).toString()).to.equal('1000')
    }
    await cakeToken.connect(addr2).transfer(addr1.address, 900)
    expect((await cakeToken.balanceOf(addr1.address)).toString()).to.equal(
      '810',
    )
    await cakeToken.connect(addr1).transfer(owner.address, 800)
    expect((await cakeToken.balanceOf(owner.address)).toString()).to.equal(
      '800',
    )
  })
})
