Ethereum Smart Contract Deployer
===
A simple module to make deploying contracts on Ethereum easy.

Tested with:
```javascript
@truffle/hdwallet-provider: ^1.5.1
solc: ^0.8.9
web3: ^1.6.0
```

# Table of content
* [Installation](#installation)
* [Requirements](#requirements)
* [Examples Of Usage](#examples-of-usage)
	* [Getting information only, using Geth as a provider](#getting-information-only,-using-geth-as-a-provider)
	* [Deploying using infura RPC API address](#deploying-using-infura-rpc-API-address)
	* [Deploying using Geth as the provider and the wallet manager](#deploying-using-geth-as-the-provider-and-the-wallet-manager)
	* [Deploying on Ganache using mnemonic phrase](#deploying-on-ganache-using-mnemonic-phrase)
* [License](#license)
* [Donate](#donate-heartpulse)

# Installation
```bash
npm i ethereum-smart-contract-deployer
```

# Requirements
1. Make sure you have the solidity compiler `solcjs` installed.
```bash
sudo npm install -g solc
```

2. The contract file is something like `ERC20Basic.sol`:
```javascript
pragma solidity ^0.8.9;

import "./node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";
contract MlibreToken is ERC20 {
    constructor(uint256 initialSupply) ERC20("Mlibre", "MLB") {
        _mint(msg.sender, initialSupply * (10 ** uint256(decimals())));
    }
}
```

# Examples Of Usage 
Deployer can work with your local `geth` client, or external providers like **infura**.  

* `httpAddress`: The RPC API URL. Default is `http://127.0.0.1:8545`
* `privateKey`: The address privateKey
* `mnemonic`: The wallet mnemonic phrase.
* `password`: The `Geth` wallet password, If you want use your local `geth` as the wallet manager
* `combined`: Module will copy all the `.sol` files that is being used(imported) into the `combined` folder. It will come handy specially when you want to `verify` a contract. Default is `false`
* `compilerOptimize`: whether compiler should use optimization or not. Default is `false`
* `setGas`: Will calculate and set the gas, gasPrice arguments. Default is `false`

Either private, or mnemonic, or password should be used.

## Getting information only, using Geth as a provider
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
			contractFilePath: './ERC20Basic.sol',
			contractName: 'MlibreToken',
			input: [12300000000],
			sender: '0xD8f24D419153E5D03d614C5155f900f4B5C8A65C',
			privateKey: secrets.privateKey,
			httpAddress: "http://127.0.0.1:8545",
			compilerOptimize: false,
			compileOutput: 'bin',
			confirmations: true
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
Compiling contract ERC20Basic.sol -> MlibreToken

ETH balance:  5.84133280435159079
Gas:  1645359
Gas Price in ETH:  0.000000001500000002
Total Cost in ETH:  0.0024680385032907182
ETH balance after deploying:  5.8388647658483
```

## Deploying using infura RPC API address
If you do not have an infura account, you can signup [here](https://infura.io/)

```javascript
let Deployer = require('ethereum-smart-contract-deployer');
let secrets = require('./secrets.json');

(async () => {
	try
	{
		let deployer = await new Deployer({
			contractFilePath: './ERC20Basic.sol',
			contractName: 'MlibreToken',
			input: [12300000000],
			sender: '0xD8f24D419153E5D03d614C5155f900f4B5C8A65C',
			privateKey: secrets.D8PrivateKey,
			httpAddress: secrets.goerliAPIKey,
			compilerOptimize: true,
			compileOutput: 'bin',
			combined: true,
			confirmations: true
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
Compiling contract ERC20Basic.sol -> MlibreToken

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

## Deploying using Geth as the provider and the wallet manager
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
			contractFilePath: './ERC20Basic.sol',
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

## Deploying on Ganache using mnemonic phrase
```javascript
let Deployer = require('ethereum-smart-contract-deployer');
let secrets = require('./secrets.json');

(async () => {
	try
	{
		let deployer = await new Deployer({
			contractFilePath: "./voter.sol",
			contractName: "Voter",
			input: [["mlibre" , "Good"]],
			sender,
			mnemonic: "gospel fault armor invest scrap manage salad ride amazing among clay feature",
			httpAddress: "http://127.0.0.1:7545",
			compilerOptimize: false,
			compileOutput: "bin",
			combined: true,
			setGas: true,
			confirmations: false
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

# License
CC0

# Donate :heartpulse:
ETH:
> 0xc9b64496986E7b6D4A68fDF69eF132A35e91838e