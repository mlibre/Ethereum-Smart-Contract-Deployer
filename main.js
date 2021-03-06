let solComplier = require("solc");
let solComplierLinker = require("solc/linker");
const Web3 = require("web3");
const fs = require("fs");
const path = require("path");
const HDWalletProvider = require("@truffle/hdwallet-provider");

let contractFolderPath;
let combineFolderPath;

class deployer 
{
	constructor ({contractFilePath, contractName, libraries, input, sender,
		address, web3, solc, linker, setGas, privateKey, password, mnemonic,
		compilerOptimize,	compileOutput, combineFolder, confirmations}) 
	{
		return (async () => 
		{
			this.contractFilePath = contractFilePath; // Contract File path
			this.contractFileName = path.parse(contractFilePath).base; // Contract File Name
			this.contractFolderPath = path.dirname(contractFilePath); // Contract Folder Path
			contractFolderPath = this.contractFolderPath; // Contract Folder Path
			this.contractName = contractName;
			this.libraries = libraries;
			this.input = input;
			this.sender = sender;
			this.privateKey = privateKey; // PrivateKey
			this.password = password;
			this.mnemonic = mnemonic;
			this.address = address || "http://127.0.0.1:8545";
			if (privateKey  || mnemonic)
			{
				this.web3 = web3 || this.hdwallet();
			}
			else if (web3)
			{
				this.web3 = web3;
			}
			else if (password)
			{
				this.web3 = this.createWeb3();
			}
			else
			{
				console.log("You have not provided neither of 'privateKey', 'password' or 'web3'");
				console.log("Creating a basic Web3 provider ...");
				this.web3 = this.createWeb3();
			}
			solComplier = solc || solComplier;
			solComplierLinker = linker || solComplierLinker;
			this.setGas = setGas || false;
			this.compilerOptimize = compilerOptimize || false;
			this.compileOutput = compileOutput;
			combineFolderPath = combineFolder;
			this.confirmations = confirmations || false;

			this.provider;
			this.contract;
			this.contractInstance;
			this.networkName;
			this.getPeerCount;
			return this;
		})();
	}

	async deploy () 
	{
		const self = this;
		await self.networkInfo();
		self.compile();
		if (self.password)
		{
			await self.unlockAccount(1000);
		}
		const Voter = new self.web3.eth.Contract(self.contract.abi);
		let bytecode = `0x${self.contract.evm.bytecode.object}`;
		if (self.libraries)
		{
			bytecode = solComplierLinker.linkBytecode(bytecode, self.libraries);
		}
		let op = {
			data: bytecode
		};
		if (self.input)
		{
			op = Object.assign(op, {
				arguments: self.input
			});
		}
		const gasEstimateValue = await Voter.deploy(op).estimateGas({
			from: self.sender
		});
		const gasPrice = await self.gasCostEstimate(gasEstimateValue, self.web3);

		console.log(`\nDeploying Contract ${self.contractName}`);
		console.log("Arguments: ", op.arguments);
		console.log();

		const opt = {
			from: self.sender,
		};
		if (this.setGas)
		{
			opt.gas = gasEstimateValue;
			opt.gasPrice = gasPrice;
		}
		self.contractInstance = await Voter.deploy(op)
		.send(opt)
		.on("transactionHash" , function (transactionHash) 
		{
			console.log(`Transaction hash: ${transactionHash}`);
		})
		.on("confirmation" , function (confirmationNumber) 
		{
			if (self.confirmations)
			{
				console.log(`Confirmation Number: ${confirmationNumber}`);
			}
		})
		.on("receipt", function (receipt)
		{
			console.log("Block number: ", receipt.blockNumber);
		})
		.on("error" , function (error) 
		{
			console.log(error);
		});
		console.log("Owner:" , self.sender);
		console.log("Contract Address:" , self.contractInstance.options.address);
		console.log("Etherscan.io:" , `https://${self.networkName}.etherscan.io/address/${self.contractInstance.options.address}`);
		return self.contractInstance;
	}

	compile () 
	{
		console.log(`Solidity Version: ${solComplier.version()}`);
		const contractRaw = fs.readFileSync(this.contractFilePath, "utf8");
		const complierInput = {
			language: "Solidity",
			sources:
			{
				[this.contractFileName]:
				{
					content: contractRaw
				}
			},
			settings:
			{
				optimizer:
				{
					enabled: this.compilerOptimize
				},
				outputSelection:
				{
					"*":
					{
						"*": [ "*" ],
						"": [ "*" ]
					}
				}
			}
		};
		console.log(`Compiling contract ${this.contractFileName}`);
		if (combineFolderPath)
		{
			try 
			{
				fs.mkdirSync(combineFolderPath);
			}
			catch (error) 
			{
				if (error.code !== "EEXIST")
				{
					throw error;
				}
			}
			try 
			{
				fs.copyFileSync(this.contractFilePath ,  path.join(combineFolderPath, this.contractFileName));
			}
			catch {}
		}
		const compiledContract = JSON.parse(solComplier.compile(JSON.stringify(complierInput), { import: this.findImports } ));
		if (compiledContract.errors)
		{
			throw compiledContract.errors;
		}
		console.log();
		this.contractName = this.contractName || Object.keys(compiledContract.contracts[this.contractFileName])[0];
		const contract = compiledContract.contracts[this.contractFileName][this.contractName];
		if (this.compileOutput)
		{
			if (!fs.existsSync(this.compileOutput))
			{
				fs.mkdirSync(this.compileOutput, { recursive: true });
			}
			fs.writeFileSync(path.join(this.compileOutput, `${this.contractName}_abi.json`), JSON.stringify(contract.abi));
		}
		this.contract = contract;
	}

	createWeb3 ()
	{
		this.web3 = new Web3(this.address);
		return this.web3;
	}

	hdwallet ()
	{
		try 
		{
			const options = {
				providerOrUrl: this.address
			};
			if (this.privateKey)
			{
				options.privateKeys = [this.privateKey];
			}
			if (this.mnemonic)
			{
				options.mnemonic = {phrase: this.mnemonic};
			}
			this.provider = new HDWalletProvider(options);
			this.web3 = new Web3(this.provider);
			return this.web3;
		}
		catch (error) 
		{
			console.error(error);
			this.provider.engine.stop();
			throw error;
		}
	}

	async info ()
	{
		const self = this;

		await this.networkInfo();
		this.compile();

		const Voter = new self.web3.eth.Contract(self.contract.abi);
		const bytecode = `0x${self.contract.evm.bytecode.object}`;
		let op = {
			data: bytecode
		};
		if (self.input)
		{
			op = Object.assign(op, {
				arguments: self.input
			});
		}
		const gasEstimateValue = await Voter.deploy(op).estimateGas({
			from: self.sender
		});
		await self.gasCostEstimate(gasEstimateValue, self.web3);
	}

	async networkInfo ()
	{
		try 
		{
			this.networkName = await this.web3.eth.net.getNetworkType();
			this.getPeerCount = await this.web3.eth.net.getPeerCount();
			console.log();
			console.log("Network Name: ", this.networkName);
			console.log("Network Peers: ", this.getPeerCount);
			console.log();
		}
		catch (error) 
		{
			console.error("Unable to get network information");
		}
	}

	async gasCostEstimate (gas)
	{
		const self = this;
		const accBalance = await self.accountBalance();
		console.log("ETH balance: ", accBalance);
		console.log("Gas: ", gas);
		const gasPriceWei = await self.web3.eth.getGasPrice();
		var gasPriceInETH = self.toFixed(self.web3.utils.fromWei(gasPriceWei));
		console.log("Gas Price in ETH: ", gasPriceInETH);
		console.log("Total Cost in ETH: ", self.toFixed(gas * gasPriceInETH));
		console.log("ETH balance after deploying: ", accBalance - gas * gasPriceInETH);
		return gasPriceWei;
		// console.log(bytecode);
		// let gasEstimate = await web3.eth.estimateGas({
		// 	from: sender,
		// 	data: bytecode,
		// 	to: sender
		// });

	// https://docs.alchemy.com/alchemy/guides/eip-1559/maxpriorityfeepergas-vs-maxfeepergas
	// web3.eth.getMaxPriorityFeePerGas().then((f) => console.log("Geth estimate:  ", Number(f)));
	}

	toFixed (number) 
	{
		return parseFloat(number).toFixed(20).replace(/\.?0+$/,"");
	}

	async accountBalance ()
	{
		return this.web3.utils.fromWei(await this.web3.eth.getBalance(this.sender));
	}

	async unlockAccount (duration)
	{
		await this.web3.eth.personal.unlockAccount(this.sender , this.password, duration);
	}

	findImports (fPath)
	{
		try 
		{
			if (contractFolderPath && contractFolderPath != "." && contractFolderPath != "./")
			{
				fPath = path.join(contractFolderPath , fPath);
			}
			const file = fs.readFileSync(fPath , "utf8");
			if (combineFolderPath)
			{
				const fileName = path.parse(fPath).base;
				fs.copyFileSync(fPath , path.join(combineFolderPath, fileName));
			}
			return {
				contents: file
			};
		}
		catch (error) 
		{
			console.log(error);
			throw error;
		}
	}
}
 

module.exports = deployer;