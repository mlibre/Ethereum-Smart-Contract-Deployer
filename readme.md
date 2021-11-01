Ethereum Smart Contract Deployer
===

A simple module to make deploying contracts on Ethereum easy.

Tested with:
```javascript
@truffle/hdwallet-provider: ^1.5.1
solc: ^0.8.9
web3: ^1.6.0
```
# Installation
```bash
npm i ethereum-smart-contract-deployer
```

# Requirements
1. Make sure you have the solidity compiler `solcjs` installed.
```bash
sudo npm install -g solc
```

2. The contract file is something like this, `ERC20Basic.sol`:
```javascript
pragma solidity ^0.8.9;
import "./node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./node_modules/@openzeppelin/contracts/access/Ownable.sol";
contract MlibreToken is ERC20, Ownable {
    constructor(uint256 initialSupply) ERC20("Mlibre", "MLB") {
        _mint(msg.sender, initialSupply * (10 ** uint256(decimals())));
    }
}
```

# Examples of usage 
The module takes some arguments like contract file path, name, ...
* `combined`: if it is `true` then module will copy all the sol file that is being used in `combined` folder. Default is `false`. It will come handy specially when you want to `verify` the contract
* `compilerOptimize`: whether compiler should use optimization or not. Default is `false`
* `httpAddress`: The RPC API URL. Default is `http://127.0.0.1:8545`
* `privateKey`: The address privateKey
* `password`: If you are using you local `Geth` as the wallet manger. It is the wallet password 

## Getting information before deploying, using Geth as a provider
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
			compileOutput: 'bin'
		});
		deployer.info()
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
If you do not have an infura key account, you can signup [here](https://infura.io/)

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
			combined: true
		});
		deployer.deploy()
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

## Deploying using Geth as a provider and wallet
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
		deployer.deploy()
	}
	catch (e)
	{
		console.error("Error:" , e);
	}
})();
```