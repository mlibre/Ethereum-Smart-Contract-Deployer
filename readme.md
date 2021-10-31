Ethereum Smart Contract Deployer
===

A simple module to make deploying contracts on Ethereum easy

# Installation
```bash
npm i ethereum-smart-contract-deployer
```

# Usage
```bash
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
			privateKey: secrets.D8PrivateKey,
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