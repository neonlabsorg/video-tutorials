// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const { ethers, hre } = require("hardhat");

async function main() {
    const TestERC721Address = ''; // paste here your deployed smart contract address
    if (!ethers.isAddress(TestERC721Address)) {
        console.log('Invalid TestERC721Address');
        return false;
    }

    const tokenId = 2009; // this is a sample value, use proper ID for production
    const [owner] = await ethers.getSigners();
    const TestERC721 = await ethers.getContractAt('TestERC721', TestERC721Address);
    await TestERC721.safeMint(owner.address, tokenId);

    console.log(
        `TestERC721 NFT with tokenId ${tokenId} has been minted to ${owner.address}` 
    );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});