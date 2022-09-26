# Hardhat Fund Me

*Updated to work with Goerli over Rinkeby.*

Using Hardhat as the development framework developed a Fund Me contract where users can fund the deployed contract (using etherscan interface / writing a script) and only the owner who deployed the contract will be able to withdraw the funds.

Performed thorough testing of the contract functions using chai to ensure smart contract functionality is as intended.


- [Hardhat Fund Me](#hardhat-fund-me)
- [Getting Started](#getting-started)
  - [Requirements](#requirements)
  - [Quickstart](#quickstart)
- [Usage](#usage)
  - [Testing](#testing)
    - [Test Coverage](#test-coverage)
- [Deployment to a testnet or mainnet](#deployment-to-a-testnet-or-mainnet)
  - [Scripts](#scripts)
  - [Estimate gas](#estimate-gas)
    - [Estimate gas cost in USD](#estimate-gas-cost-in-usd)
  - [Verify on etherscan](#verify-on-etherscan)



# Getting Started

## Requirements

- [git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
  - Confirm if you can run `git --version` and you see a response like `git version x.x.x`
- [Nodejs](https://nodejs.org/en/)
  - Confirm if you can run `node --version` and get an ouput like: `vx.x.x`
- [Yarn](https://yarnpkg.com/getting-started/install) instead of `npm`
  - Confirm if you can run `yarn --version` and get an output like: `x.x.x`
    - You might need to [install it with `npm`](https://classic.yarnpkg.com/lang/en/docs/install/) or `corepack`

## Quickstart

```
git clone https://github.com/rpranayr/hardhat-fund-me
cd hardhat-fund-me
yarn
```




# Usage

Deploy:

```
yarn hardhat deploy
```

## Testing

```
yarn hardhat test
```

### Test Coverage

```
yarn hardhat coverage
```


# Deployment to a testnet or mainnet

1. Setup environment variables

You'll have to setup the `.env` file and add in `GOERLI_RPC_URL` and `PRIVATE_KEY`.


- `PRIVATE_KEY`: The private key of your account (like from [metamask](https://metamask.io/)). **NOTE:** FOR DEVELOPMENT, PLEASE USE A KEY THAT DOESN'T HAVE ANY REAL FUNDS ASSOCIATED WITH IT.
  - You can [learn how to export it here](https://metamask.zendesk.com/hc/en-us/articles/360015289632-How-to-Export-an-Account-Private-Key).
- `GOERLI_RPC_URL`: You need an RPC URL from an RPC Node provider such as Infura, Alchemy or QuickNode which have an underelying node to interact with the block to whome you can send your testnet transactions. In this case, this is url of the goerli testnet node you're working with. You can get setup with one for free from [Alchemy](https://alchemy.com/?r=jg1Nzg0OTkxNjcwN)

1. Get testnet ETH

Head over to [faucets.chain.link](https://faucets.chain.link/) or [faucet.paradigm.xyz](https://faucet.paradigm.xyz/) and get some tesnet ETH for goerli. 

3. Deploy

```
yarn hardhat deploy --network goerli
```

## Scripts

After deploying to a testnet or local net, you can run the scripts. 

```
yarn hardhat run scripts/fund.js
```

or
```
yarn hardhat run scripts/withdraw.js
```

## Estimate gas

You can estimate how much gas things cost by running:

```
yarn hardhat test
```

And you'll see and output file called `gas-report.txt`

### Estimate gas cost in USD

To get a USD estimation of gas cost, you'll need a `COINMARKETCAP_API_KEY` environment variable. You can get one for free from [CoinMarketCap](https://pro.coinmarketcap.com/signup). 

Then, uncomment the line `coinmarketcap: COINMARKETCAP_API_KEY,` in `hardhat.config.js` to get the USD estimation. Just note, everytime you run your tests it will use an API call, so it might make sense to have using coinmarketcap disabled until you need it. You can disable it by just commenting the line back out. 


## Verify on etherscan

To verify your deployed contract on the goerli testnet get an [API Key](https://etherscan.io/myapikey) from Etherscan and put it in the `.env` file as `ETHERSCAN_API_KEY`.If you have your API key set, it will auto verify goerli contracts!

However, you can manual verify with:

```
yarn hardhat verify --constructor-args arguments.js DEPLOYED_CONTRACT_ADDRESS
```

