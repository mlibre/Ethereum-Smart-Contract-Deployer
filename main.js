const solc = require("solc");
const Web3 = require("web3");
const fs = require("fs");
var path = require("path");
const HDWalletProvider = require("@truffle/hdwallet-provider");

class deployer 
{
	constructor ({contractFilePath, contractName, input, sender,
		privateKey, httpAddress, web3, compilerOptimize,
		compileOutput}) 
	{
		this.contractFilePath = contractFilePath; // Contract File path
		this.CFileName = path.parse(contractFilePath).base; // Contract File Name
		this.contractName = contractName;
		this.input = input;
		this.sender = sender;
		this.privateKey = privateKey; // PrivateKey
		this.httpAddress = httpAddress || "http://127.0.0.1:8545";
		this.web3 = web3 || this.hdwallet();
		this.compilerOptimize = compilerOptimize || false;
		this.compileOutput = compileOutput || "bin";
		this.provider;
		this.contract;
		this.networkName;
		this.getPeerCount;
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

	async deploy () 
	{
		const self = this;
		await this.networkInfo();
		self.compile();
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
		
		console.log("\nDeploying Contract ...");
		console.log("Arguments: ", op.arguments);
		console.log();

		Voter.deploy(op)
		.send({
			from: self.sender
		})
		.on("transactionHash" , function (transactionHash) 
		{
			console.log(`Transaction hash: ${transactionHash}`);
		})
		.on("confirmation" , function (confirmationNumber) 
		{
			console.log(`Confirmation Number: ${confirmationNumber}`);
		})
		.on("error" , function (error) 
		{
			console.log(error);
		})
		.then(function (receipt) 
		{
			console.log("Owner:" , self.sender);
			console.log("Contract Address:" , receipt.options.address);
			console.log("Etherscan.io:" , `https://${self.networkName}.etherscan.io/address/${receipt.options.address}`);
		});
	}

	compile () 
	{
		console.log(`Solidity Version: ${solc.version()}`);
		const contractRaw = fs.readFileSync(this.contractFilePath, "utf8");
		const complierInput = {
			language: "Solidity",
			sources:
			{
				[this.CFileName]:
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
		console.log(`Compiling contract ${this.CFileName} -> ${this.contractName}`);
		const compiledContract = JSON.parse(solc.compile(JSON.stringify(complierInput), { import: this.findImports } ));
		if (compiledContract.errors)
		{
			throw compiledContract.errors;
		}
		console.log();
		const contractName = this.contractName || Object.keys(compiledContract.contracts[this.CFileName])[0];
		const contract = compiledContract.contracts[this.CFileName][contractName];
		// console.log(contractName , contract.abi);
		const {abi} = contract;
		if (!fs.existsSync(this.compileOutput))
		{
			fs.mkdirSync(this.compileOutput, { recursive: true });
		}
		fs.writeFileSync(path.join(this.compileOutput, `${contractName}_abi.json`), JSON.stringify(abi));
		this.contract = contract;
	}

	async createHTTPWeb3 ()
	{
		const web3 = new Web3();
		this.web3 = await web3.setProvider(new web3.providers.HttpProvider(this.httpAddress));
		return this.web3;
	}

	hdwallet ()
	{
		try 
		{
			this.provider = new HDWalletProvider({
				privateKeys: [this.privateKey],
				providerOrUrl: this.httpAddress
			});
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
			console.errors("Unable to get network information");
		}
	}

	async gasCostEstimate (gasValue)
	{
		const self = this;
		const accBalance = await self.accountBalance();
		console.log("ETH balance: ", accBalance);
		console.log("Gas: ", gasValue);
		await self.web3.eth.getGasPrice( function (error, gasPriceWei) 
		{
			var gasPriceInETH = self.web3.utils.fromWei(gasPriceWei);
			console.log("Gas Price in ETH: ", gasPriceInETH);
			console.log("Total Cost in ETH: ", gasValue * gasPriceInETH);
			console.log("ETH balance after deploying: ", accBalance - gasValue * gasPriceInETH);
		});
		// console.log(bytecode);
		// let gasEstimate = await web3.eth.estimateGas({
		// 	from: sender,
		// 	data: bytecode,
		// 	to: sender
		// });

	// https://docs.alchemy.com/alchemy/guides/eip-1559/maxpriorityfeepergas-vs-maxfeepergas
	// web3.eth.getMaxPriorityFeePerGas().then((f) => console.log("Geth estimate:  ", Number(f)));
	}

	async accountBalance ()
	{
		return this.web3.utils.fromWei(await this.web3.eth.getBalance(this.sender));
	}

	async unlockAccount (password, duration)
	{
		await this.web3.eth.personal.unlockAccount(this.sender , password, duration);
	}

	findImports (path)
	{
		try 
		{
			return {
				contents: fs.readFileSync(path , "utf8")
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