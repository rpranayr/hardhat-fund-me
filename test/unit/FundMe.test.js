const { assert, expect } = require("chai")
const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip // If not on development chain skip otherwise run
    : describe("FundMe", async () => {
          let fundMe
          let deployer
          let MockV3Aggregator
          const sendValue = ethers.utils.parseEther("2")

          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["all"])
              // this will deploy all scripts in the deploy folder with the tags "all"
              fundMe = await ethers.getContract("FundMe", deployer)
              // Adding deployer here to make sure whatever function is called on Fund Me contract, deployer is the one calling it

              MockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              )
          })

          describe("constructor", async function () {
              it("sets the aggregator addresses correctly", async () => {
                  const response = await fundMe.getPriceFeed()
                  assert.equal(response, MockV3Aggregator.address)
              })
          })

          describe("fund", async function () {
              it("fails if you don't send enough eth", async () => {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "Sending <= 1eth"
                  )
              })

              it("updates the amount funded data structure", async () => {
                  await fundMe.fund({ value: sendValue })
                  const response = await fundMe.getAddressToAmountFunded(
                      deployer
                  )
                  assert.equal(response.toString(), sendValue.toString())
              })

              it("adds funder to array of funders", async () => {
                  await fundMe.fund({ value: sendValue })
                  const funder = await fundMe.getFunder(0)
                  assert.equal(funder, deployer)
              })
          })

          describe("withdraw", async function () {
              beforeEach(async () => {
                  await fundMe.fund({ value: sendValue })
              })

              it("withdraw ETH from a single founder", async () => {
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  // can use ethers.provider instead of fundMe.provider as well

                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  const transactionResponse = await fundMe.withdraw()
                  const txReceipt = await transactionResponse.wait(1)

                  const { gasUsed, effectiveGasPrice } = txReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )

                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )
              })

              it("allows us to withdraw from multiple funders", async () => {
                  const accounts = await ethers.getSigners()
                  for (let i = 1; i < 6; ++i) {
                      // starting from 1 because 0th account is the deployer
                      const fundMeConnectedContract = fundMe.connect(
                          accounts[i]
                      )
                      // By passing in a Signer. this will return a Contract which will act on behalf of that signer.
                      await fundMeConnectedContract.fund({ value: sendValue })
                  }

                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  // can use ethers.provider instead of fundMe.provider as well

                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  const txResponse = await fundMe.withdraw()
                  const txReceipt = await txResponse.wait(1)

                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )

                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  const { gasUsed, effectiveGasPrice } = txReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )
                  await expect(fundMe.getFunder(0)).to.be.reverted
                  // expecting getFunder array to be empty

                  for (let i = 1; i < 6; ++i) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      )
                  }
                  // asserting every funder should have 0 funded amount
              })

              it("only allows owner to withdraw", async () => {
                  const accounts = await ethers.getSigners()
                  const attacker = accounts[1]
                  const attackerConnectedContract = await fundMe.connect(
                      attacker
                  )

                  await expect(
                      attackerConnectedContract.withdraw()
                  ).to.be.revertedWith("FundMe__NotOwner")

                  //assert(await fundMe.i_owner(), deployer.address)
              })

              it("cheaperWithdraw testing (multi-funder)", async () => {
                  const accounts = await ethers.getSigners()
                  for (let i = 1; i < 6; ++i) {
                      // starting from 1 because 0th account is the deployer
                      const fundMeConnectedContract = fundMe.connect(
                          accounts[i]
                      )
                      // By passing in a Signer. this will return a Contract which will act on behalf of that signer.
                      await fundMeConnectedContract.fund({ value: sendValue })
                  }

                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  // can use ethers.provider instead of fundMe.provider as well

                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  const txResponse = await fundMe.cheaperWithdraw()
                  const txReceipt = await txResponse.wait(1)

                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )

                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  const { gasUsed, effectiveGasPrice } = txReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )
                  await expect(fundMe.getFunder(0)).to.be.reverted
                  // expecting getFunder array to be empty

                  for (let i = 1; i < 6; ++i) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      )
                  }
                  // asserting every funder should have 0 funded amount
              })

              it("cheaperWithdraw testing (single-funder)", async () => {
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  // can use ethers.provider instead of fundMe.provider as well

                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  const transactionResponse = await fundMe.cheaperWithdraw()
                  const txReceipt = await transactionResponse.wait(1)

                  const { gasUsed, effectiveGasPrice } = txReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )

                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )
              })
          })
      })
