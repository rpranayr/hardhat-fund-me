const { assert } = require("chai")
const { ethers, getNamedAccounts, network } = require("hardhat")

const { developmentChains } = require("../../helper-hardhat-config")

developmentChains.includes(network.name)
    ? describe.skip // If on development chain skip otherwise run
    : describe("FundMe Staging Tests", async function () {
          let fundMe
          let deployer
          const sendValue = ethers.utils.parseEther("0.1")

          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer
              fundMe = await ethers.getContract("FundMe", deployer)
          })

          it("allows people to fund and withdraw", async () => {
              //await fundMe.fund({ value: sendValue })
              await fundMe.withdraw({ gasLimit: 100000 })

              const endingBalance = await fundMe.provider.getBalance(
                  fundMe.address
              )
              console.log(
                  endingBalance.toString() +
                      " should equal 0, running assert equal..."
              )
              assert.equal(endingBalance.toString(), "0")
          })
      })
