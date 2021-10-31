const solc = require("solc");
const Web3 = require("web3");
const fs = require("fs");
var path = require("path");
const HDWalletProvider = require("@truffle/hdwallet-provider");

class deployer 
{
	constructor ({CFilePath, CName, CInput, senderAddress,
		privateKey, httpAddress, web3, compilerOptimize,
		compileOutput}) 
	{
		this.CFilePath = CFilePath; // Contract File Address
		this.CFileName = path.parse(CFilePath).base; // Contract File Name
		this.CName = CName;
		this.CInput = CInput;
		this.senderAddress = senderAddress;
		this.privateKey = privateKey; // PrivateKey
		this.httpAddress = httpAddress || "http://127.0.0.1:8545";
		this.web3 = web3 || this.hdwallet();
		this.compilerOptimize = compilerOptimize || false;
		this.compileOutput = compileOutput || "bin";
		this.provider;
		this.networkName;
		this.getPeerCount;
		this.contract;
	}
	async deploy () 
	{
		this.compile();
		const Voter = new this.web3.eth.Contract(this.contract.abi);
		const bytecode = `0x${this.contract.evm.bytecode.object}`;
		let op = {
			data: bytecode
		};
		if (this.CInput)
		{
			op = Object.assign(op, {
				arguments: this.CInput
			});
		}
		const gasEstimateValue = await Voter.deploy(op).estimateGas({
			from: this.senderAddress
		});
		await this.gasCostEstimate(gasEstimateValue, this.web3);
		console.log("\nArguments: ", op.arguments);
		console.log("Deploying Contract ...\n");
		Voter.deploy(op)
		.send({
			from: this.senderAddress
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
			console.log("Owner:" , this.senderAddress);
			console.log("Contract Address:" , receipt.options.address);
			console.log(`${this.networkName} etherscan` , `https://${this.networkName}.etherscan.io/address/${receipt.options.address}`);
		});
	}
	async info ()
	{
		await this.networkInfo();
		this.compile();
		const Voter = new this.web3.eth.Contract(this.contract.abi);
		const bytecode = `0x${this.contract.evm.bytecode.object}`;
		let op = {
			data: bytecode
		};
		if (this.CInput)
		{
			op = Object.assign(op, {
				arguments: this.CInput
			});
		}
		const gasEstimateValue = await Voter.deploy(op).estimateGas({
			from: this.senderAddress
		});
		await this.gasCostEstimate(gasEstimateValue, this.web3);
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
		this.networkName = await this.web3.eth.net.getNetworkType();
		this.getPeerCount = await this.web3.eth.net.getPeerCount();
		console.log();
		console.log("Network Name: ", this.networkName);
		console.log("Network getPeerCount: ", this.getPeerCount);
		console.log();
	}
	compile () 
	{
		const contractRaw = fs.readFileSync(this.CFilePath, "utf8");

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
		console.log("Compiling contract:" , this.CFileName);
		const compiledContract = JSON.parse(solc.compile(JSON.stringify(complierInput), { import: this.findImports } ));
		if (compiledContract.errors)
		{
			throw compiledContract.errors;
		}
		console.log("Contract Compiled!\n");
		const contractName = this.CName || Object.keys(compiledContract.contracts[this.CFileName])[0];
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
	async unlockAccount (password, duration)
	{
		await this.web3.eth.personal.unlockAccount(this.senderAddress , password, duration);
	}
	async gasCostEstimate (gasValue)
	{
		const self = this;
		const accBalance = await self.accountBalance();
		console.log("Current ETH balance: ", accBalance);
		console.log("Gas: ", gasValue);
		await self.web3.eth.getGasPrice( function (error, gasPriceWei) 
		{
			var gasPriceInETH = self.web3.utils.fromWei(gasPriceWei);
			console.log("Gas Estimate Price in ETH: ", gasPriceInETH);
			console.log("Total Cost in ETH: ", gasValue * gasPriceInETH);
			console.log("Balance after deploying: ", accBalance - gasValue * gasPriceInETH);
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
		return this.web3.utils.fromWei(await this.web3.eth.getBalance(this.senderAddress));
	}
}
 

module.exports = deployer;