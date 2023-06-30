import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';
import {parseEther} from 'ethers/lib/utils';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
	const {ethers, deployments, getNamedAccounts} = hre;
	const {deploy} = deployments;

	const {deployer, simpleERC20Beneficiary: buyer} = await getNamedAccounts();

	// Sepolia 

	// await deploy('SeatAssigner', {
	// 	from: deployer,
	// 	args: [
	// 		'0x779877A7B0D9E8603169DdbD7836e478b4624789',
	// 		'0xab18414CD93297B0d12ac29E63Ca20f515b3DB46', //wrapper
	// 	],
	// 	log: true,
	// 	autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
	// });

	// // Fantom_t

	// await deploy('SeatAssigner', {
	// 	from: deployer,
	// 	args: [
	// 		'0xfaFedb041c0DD4fA2Dc0d87a6B0979Ee6FA7af5F',
	// 		'0x38336BDaE79747a1d2c4e6C67BBF382244287ca6', //wrapper
	// 	],
	// 	log: true,
	// 	autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
	// });

	// Fantom

	await deploy('SeatAssigner', {
		from: deployer,
		args: [
			'0x6F43FF82CCA38001B6699a8AC47A2d0E66939407',
			'0xeDA5B00fB33B13c730D004Cf5D1aDa1ac191Ddc2', //wrapper
		],
		log: true,
		autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
	});

	// 0xfaFedb041c0DD4fA2Dc0d87a6B0979Ee6FA7af5F link 
	// 0x38336BDaE79747a1d2c4e6C67BBF382244287ca6
};
export default func;
func.tags = ['seat'];
func.dependencies = [];
