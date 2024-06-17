// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const { ethers } = require("hardhat");
const web3 = require("@solana/web3.js");
const { config } = require('./config');

async function main() {
    const connection = new web3.Connection(config.SOLANA_NODE, "processed");
    const [owner] = await ethers.getSigners();

    const TestCallSolanaFactory = await ethers.getContractFactory("TestCallSolana");
    let TestCallSolanaAddress = config.CALL_SOLANA_SAMPLE_CONTRACT;
    let TestCallSolana;
    let tx;
    let receipt;

    if (ethers.isAddress(TestCallSolanaAddress)) {
        TestCallSolana = TestCallSolanaFactory.attach(TestCallSolanaAddress);
    } else {
        TestCallSolana = await ethers.deployContract("TestCallSolana");
        await TestCallSolana.waitForDeployment();

        TestCallSolanaAddress = TestCallSolana.target;
        console.log(
            `TestCallSolana deployed to ${TestCallSolana.target}`
        );
    }

    let contractPublicKeyInBytes = await TestCallSolana.getNeonAddress(TestCallSolanaAddress);
    let contractPublicKey = ethers.encodeBase58(contractPublicKeyInBytes);
    console.log(contractPublicKey, 'contractPublicKey');

    let ownerPublicKeyInBytes = await TestCallSolana.getNeonAddress(owner.address);
    let ownerPublicKey = ethers.encodeBase58(ownerPublicKeyInBytes);
    console.log(ownerPublicKey, 'ownerPublicKey');

    // ============================= SPLTOKEN ACCOUNT ATA CREATION EXAMPLE ====================================
    console.log('Creating SPLToken account through createResource method ...');
    let salt = ethers.encodeBytes32String('salt' + Date.now().toString()); // random seed on each script call
    tx = await TestCallSolana.createResource(
        salt,
        config.SIZES.SPLTOKEN_ACOUNT,
        await connection.getMinimumBalanceForRentExemption(config.SIZES.SPLTOKEN_ACOUNT),
        config.utils.publicKeyToBytes32(config.ACCOUNTS.TOKEN_PROGRAM)
    );
    receipt = await tx.wait(3);
    console.log(tx, 'tx');
    console.log(receipt.logs[0].args, 'receipt args');
    
    let getResourceAddress = await TestCallSolana.getResourceAddress(salt);
    console.log(getResourceAddress, 'getResourceAddress');

    // ============================= ACCOUNT CREATION EXAMPLE ====================================
    console.log('Creating Account through createResource method ...');
    salt = ethers.encodeBytes32String('salt' + Date.now().toString()); // random seed on each script call
    tx = await TestCallSolana.createResource(
        salt,
        0,
        await connection.getMinimumBalanceForRentExemption(0),
        config.utils.publicKeyToBytes32(web3.SystemProgram.programId)
    );
    receipt = await tx.wait(3);
    console.log(tx, 'tx');
    console.log(receipt.logs[0].args, 'receipt args');
    
    getResourceAddress = await TestCallSolana.getResourceAddress(salt);
    console.log(getResourceAddress, 'getResourceAddress');
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});