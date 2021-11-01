Ethereum Smart Contract Deployer
===

A simple module to make deploying contracts on Ethereum easy

# Installation
```bash
npm i ethereum-smart-contract-deployer
```

# Requirements
1. If you want to use your local `Geth`, make sure it is up and running.
```bash
geth --goerli --ws --http --syncmode=light --http.api="eth,net,web3,personal,txpool" --allow-insecure-unlock  --http.corsdomain "*"
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

# Usage
```javascript
let Deployer = require('ethereum-smart-contract-deployer');
let secrets = require('./secrets.json');

(async () => {
	try
	{
		let deployer = await new Deployer({
			CFilePath: './ERC20Basic.sol',
			CName: 'MlibreToken',
			CInput: [12300000000],
			senderAddress: '0xD8f24D419153E5D03d614C5155f900f4B5C8A65C',
			privateKey: secrets.privateKey,
			httpAddress: "http://127.0.0.1:8545",
			compilerOptimize: false,
			compileOutput: 'bin'
		});
		deployer.info()
		// deployer.deploy()
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

Compiling contract ERC20Basic.sol -> MlibreToken

Current ETH balance:  5.84133280435159079
Gas:  1645359
Gas Estimate Price in ETH:  0.000000001500000002
Total Cost in ETH:  0.0024680385032907182
Balance after deploying:  5.8388647658483
```