// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const { ethers } = require("hardhat");
const bs58 = require("bs58");

async function main() {
    const TestReadTokenAccountDataFactory = await ethers.getContractFactory("TestReadTokenAccountData");
    const TestReadTokenAccountDataAddress = "";
    const solanaTokenAccount = "6VAvEN2x6bPxBDc6xcDtnzYUw7cLziBAuadRZmmM8GJD";
    let TestReadTokenAccountData;

    const solanaTokenAccountHex = "0x" + bs58.decode(solanaTokenAccount).toString("hex");
    console.log("Solana token account converted to hex: ", solanaTokenAccountHex);

    if (ethers.isAddress(TestReadTokenAccountDataAddress)) {
        TestReadTokenAccountData = TestReadTokenAccountDataFactory.attach(TestReadTokenAccountDataAddress);
    } else {
        TestReadTokenAccountData = await ethers.deployContract("TestReadTokenAccountData");
        await TestReadTokenAccountData.waitForDeployment();

        console.log(
        `TestReadTokenAccountData token deployed to ${TestReadTokenAccountData.target}`
        );
    }

    const tokenAccountLength = await TestReadTokenAccountData.readSolanaDataAccountLen(solanaTokenAccountHex);
    console.log("Token account length:", tokenAccountLength);

    let tokenAccountRawData = await TestReadTokenAccountData.readSolanaDataAccountRaw(
        solanaTokenAccountHex,
        0,
        tokenAccountLength
    );
    console.log("Token account raw data:", tokenAccountRawData);

    let mint = await TestReadTokenAccountData.readSolanaDataAccountPublicKey(
        solanaTokenAccountHex,
        0,
        32
    );
    console.log(
        "Mint account public key:",
        bs58.encode(Buffer.from(mint.slice(2), "hex"))
    );

    let owner = await TestReadTokenAccountData.readSolanaDataAccountPublicKey(
        solanaTokenAccountHex,
        32,
        32
    );
    console.log(
        "Owner account public key: ",
        bs58.encode(Buffer.from(owner.slice(2), "hex"))
    );

    let amount = await TestReadTokenAccountData.readSolanaDataAccountAmount(
        solanaTokenAccountHex,
        64,
        8
    );
    console.log("Token amount:", amount);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
