# Ethereum Smart Contract Deployer

A simple module to make deploying contracts on Ethereum easy.

Tested with:

```javascript
@truffle/hdwallet-provider: ^1.5.1
solc: ^0.8.10
web3: ^1.6.0
```

## Table Of Content

* [Installation](#installation)
* [Requirements](#requirements)
* [Examples Of Usage](#examples-of-usage)
  * [Deploying using infura RPC API address](#deploying-using-infura-rpc-API-address)
  * [Getting information only, using Geth as a provider](#getting-information-only-using-geth-as-a-provider)
  * [Deploying using Geth as the provider and the wallet manager](#deploying-using-geth-as-the-provider-and-the-wallet-manager)
  * [Deploying on Ganache using a mnemonic phrase](#deploying-on-ganache-using-a-mnemonic-phrase)
  * [Advance example - Multi Signature Wallet](#advance-example---multi-signature-wallet)
  * [Advance example - Libraries](#advance-example---libraries)
* [License](#license)
* [Donate](#donate-heartpulse)

## Installation

```bash
npm i ethereum-smart-contract-deployer
```

## Requirements

Make sure you have the solidity compiler `solcjs` installed.

```bash
sudo npm install -g solc
```

## Examples Of Usage

The deployer can work with your local `geth` client or external providers like **infura**.  

* `contractFilePath`: Contract file path
* `contractName`: Contract name. If not provided, will use the first contract in the file
* `address`: The RPC API URL. Default is `http://127.0.0.1:8545`
* `privateKey`: The address privateKey
* `mnemonic`: The wallet mnemonic phrase
* `password`: The `Geth` wallet password, If you want to use your local `geth` as the wallet manager
* `input`: Contract Constructor input. don't pass it if the constructor does not have any input
* `sender`: The sender address
* `web3`: If you have your own web3 object, you can pass it to the deployer. otherwise module will create a new one.
* `compilerOptimize`: whether the compiler should use optimization or not. Default is `false`
* `combined`: Will copy all the `.sol` files that are being used(imported) into the `combined` folder It will come in handy, especially when you want to `verify` a contract. Default is `false`
* `setGas`: Will calculate and set the `gas` and `gasPrice` arguments. Default is `false`
* `compileOutput`: Will compile the contract and save the output(abi, ...) to the `compileOutput` folder. Default is `bin`
* `confirmations`: Log the transaction confirmations. Default is `false`
* `libraries`: If you are using libraries, you need to provide the library's contract address

Either `privateKey`, or `mnemonic`, or `password` or `web3` should be provided. or a basic `web3` provider will be created.

You can find the sample contracts in the `contracts` folder.

### Deploying using infura RPC API address

If you do not have an infura account, you can signup [here](https://infura.io/)

```javascript
let Deployer = require('ethereum-smart-contract-deployer');
let secrets = require('./secrets.json');

(async () => {
 try
 {
  let deployer = await new Deployer({
   contractFilePath: 'ERC20.sol',
   input: [12300000000],
   sender: '0xD8f24D419153E5D03d614C5155f900f4B5C8A65C',
   privateKey: secrets.D8PrivateKey,
   address: secrets.goerliAPIKey
  });
  await deployer.deploy()
 }
 catch (e)
 {
  console.error("Error:" , e);
 }
})();
```

Output:

```java
Network Name:  goerli
Network Peers:  17

Solidity Version: 0.8.9
Compiling contract ERC20.sol -> MlibreToken

ETH balance:  5.84133280435159079
Gas:  838377
Gas Price in ETH:  0.000000001030000006
Total Cost in ETH:  0.000863528315030262
ETH balance after deploying:  5.84046927603656

Deploying Contract ...
Arguments:  [ 12300000000 ]

Transaction hash: 0x74b32c42c7f331b08a7c0f8785c569541bd268b425bf610cbfbcd97c3895ecc3
Confirmation Number: 0
Owner: 0xD8f24D419153E5D03d614C5155f900f4B5C8A65C
Contract Address: 0x5c71E30f5c846Fd1F74a71E5fae274780aa57e51
Etherscan.io: https://goerli.etherscan.io/address/0x5c71E30f5c846Fd1F74a71E5fae274780aa57e51
```

### Getting information only, using Geth as a provider

You can run a `Geth` by:

```bash
geth --goerli --ws --http --syncmode=light --http.api="eth,net,web3,personal,txpool" --allow-insecure-unlock  --http.corsdomain "*"
```

```javascript
let Deployer = require('ethereum-smart-contract-deployer');
let secrets = require('./secrets.json');

(async () => {
 try
 {
  let deployer = await new Deployer({
   contractFilePath: './ERC20.sol',
   contractName: 'MlibreToken',
   input: [12300000000],
   sender: '0xD8f24D419153E5D03d614C5155f900f4B5C8A65C',
   address: "http://127.0.0.1:8545"
  });
  await deployer.info()
 }
 catch (e)
 {
  console.log("Error:" , e);
 }
})();
```

Output:

```java
Network Name:  goerli
Network Peers:  4

Solidity Version 0.8.9
Compiling contract ERC20.sol -> MlibreToken

ETH balance:  5.84133280435159079
Gas:  1645359
Gas Price in ETH:  0.000000001500000002
Total Cost in ETH:  0.0024680385032907182
ETH balance after deploying:  5.8388647658483
```

### Deploying using Geth as the provider and the wallet manager

You may want use you local `Geth` as the wallet manager. And you have already imported your accounts there:

```bash
geth account import ~/path.to/privateKey
# Set the password
```

```javascript
let Deployer = require('ethereum-smart-contract-deployer');
let secrets = require('./secrets.json');

(async () => {
 try
 {
  let deployer = await new Deployer({
   contractFilePath: './ERC20.sol',
   contractName: 'MlibreToken',
   input: [12300000000],
   sender: '0xD8f24D419153E5D03d614C5155f900f4B5C8A65C',
   password: secrets.gethPassword,
   compilerOptimize: false,
   compileOutput: 'bin'
  });
  // await deployer.info()
  await deployer.deploy()
 }
 catch (e)
 {
  console.error("Error:" , e);
 }
})();
```

### Deploying on Ganache using a mnemonic phrase

```javascript
let Deployer = require('ethereum-smart-contract-deployer');

(async () => {
 try
 {
  let deployer = await new Deployer({
   contractFilePath: "./voter.sol",
   contractName: "Voter",
   input: [["mlibre" , "Good"]],
   sender: "0xc6b2fB12F47dcA59e2d79D6AdE8825Dc80314Db9",
   mnemonic: "gospel fault armor invest scrap manage salad ride amazing among clay feature",
   address: "http://127.0.0.1:7545",
   compilerOptimize: false,
   compileOutput: "bin",
   combined: true,
   setGas: true,
   confirmations: true
  })
  let contract = await deployer.deploy()
  // let abi = deployer.contract.abi
  // let contract = deployer.contractInstance
  await contract.methods.addOption("new option").send({from: sender})
  let options = await contract.methods.getOptions().call()
  await contract.methods.startVoting().send({from: sender})
  await contract.methods.vote(0).send({from: sender})
  const votes = await contract.methods.getVotes().call({
   from: sender,
  })
  console.log(options, votes)
 }
 catch (e)
 {
  console.error("Error:" , e);
 }
})();
```

### Advance example - Multi Signature Wallet

```javascript

(async () => {
 let sender = "0xc6b2fB12F47dcA59e2d79D6AdE8825Dc80314Db9"
 try {
  let deployer = await new Deployer({
   contractFilePath: "./multi-sig-wallet.sol",
   contractName: "MultiSigWallet",
   input: [
    "0x14c6814d103db28ea5aE0086552051f21e3790e3", // beneficiary
    ["0xCbee283AA4b615E8B474092F43710B786e1aBE16", "0x3CCc5104aEA8f2faDfbd086a08cE6f3515Bf08BB" , "0xF5cb7F7D0F1012e159eb6Cd2334b8C202596a54e"], // approvers
    2 // min approves
   ],
   sender,
   mnemonic: "gospel fault armor invest scrap manage salad ride amazing among clay feature",
   address: "http://127.0.0.1:7545",
   compilerOptimize: false,
   compileOutput: "bin",
   combined: true,
   setGas: true,
   confirmations: false
  })
  let contract = await deployer.deploy()
  // let abi = deployer.contract.abi
  await deployer.web3.eth.sendTransaction({
   from: sender,
   to: contract.options.address,
   value: deployer.web3.utils.toWei("3", "ether")
  })
  let res = await contract.methods.approve().send({from: "0xCbee283AA4b615E8B474092F43710B786e1aBE16"})
  console.log(res.events)
  res = await contract.methods.approve().send({from: "0x3CCc5104aEA8f2faDfbd086a08cE6f3515Bf08BB"})
  console.log(res.events)
 }
 catch (e) {
  console.error("Error:", e)
 }
})()
```

### Advance example - Libraries

```javascript
let Deployer = require("ethereum-smart-contract-deployer");

(async () => {
 // Deploying Utils Library
 let utilsAddress
 try {
  let sender = "0xc6b2fB12F47dcA59e2d79D6AdE8825Dc80314Db9"
  let deployer = await new Deployer({
   contractFilePath: "./utils.sol",
   contractName: "utils",
   sender,
   mnemonic: "gospel fault armor invest scrap manage salad ride amazing among clay feature",
   address: "http://127.0.0.1:7545",
  })
  let contract = await deployer.deploy()
  utilsAddress = contract.options.address
 }
 catch (e) {
  console.error("Error:", e)
 }

 try {
  let sender = "0xc6b2fB12F47dcA59e2d79D6AdE8825Dc80314Db9"
  let deployer = await new Deployer({
   contractFilePath: "./crowd-funding-using-library.sol",
   contractName: "CrowdFundingWithDeadline",
   libraries: {
    "utils.sol:utils": utilsAddress
   },
   input: [
    "My Campaign",
    2, // target
    5, // Funding Deadline in minutes
    "0x14c6814d103db28ea5aE0086552051f21e3790e3" // beneficiary
   ],
   sender,
   mnemonic: "gospel fault armor invest scrap manage salad ride amazing among clay feature",
   address: "http://127.0.0.1:7545",
   compilerOptimize: false,
   compileOutput: "bin",
   combined: true,
   setGas: true,
   confirmations: false
  })
  let contract = await deployer.deploy()
  await contract.methods.contribute().send(
   {
    value: deployer.web3.utils.toWei("3", "ether"),
    from: "0xCbee283AA4b615E8B474092F43710B786e1aBE16"
   })
  await contract.methods.finishCrowdFunding().send({from: sender})
  await contract.methods.collect().send({from: sender})
  console.log(await contract.methods.getFundingDeadline().call())
 }
 catch (e) {
  console.error("Error:", e)
 }
})()
```

## License

CC0

## Donate 💗

ETH:
> 0xc9b64496986E7b6D4A68fDF69eF132A35e91838e
