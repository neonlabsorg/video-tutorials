const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EVMPrecompiles", function () {
  let EVMPrecompilesFactory,
    evmPrecompiles,
    signer,
    messageHash,
    signature,
    v,
    r,
    s;

  before(async function () {
    [signer] = await ethers.getSigners();
    EVMPrecompilesFactory = await ethers.getContractFactory("EVMPrecompiles");
    EVMPrecompilesContractAddress = "";
    //"0xba0861e33c7c46F92ae556b479EfcED9032027b0"; //(Deployed Sepolia address)
    //"0xD74fA95128AA1FeE703A76278bc8659A659CC273"; //(Deployed Mainnet address)
    if (ethers.isAddress(EVMPrecompilesContractAddress)) {
      evmPrecompiles = EVMPrecompilesFactory.attach(
        EVMPrecompilesContractAddress
      );
    } else {
      evmPrecompiles = await EVMPrecompilesFactory.deploy();
      await evmPrecompiles.waitForDeployment();
      console.log("Contract address:", evmPrecompiles.target);
    }
  });

  describe("SignatureVerifier", function () {
    before(async function () {
      const test = "0x512345673440";
      const testBytes = ethers.getBytes(test);
      messageHash = ethers.hashMessage(testBytes);

      //Sign the testBytes
      signature = await signer.signMessage(testBytes);

      const splitSig = ethers.Signature.from(signature);
      v = splitSig.v;
      r = splitSig.r;
      s = splitSig.s;
    });

    it("Should recover the correct address from the signature via EVM precompile ecrecover 0x01", async function () {
      const recoveredAddress = await evmPrecompiles.recoverSignature(
        messageHash,
        v,
        r,
        s
      );
      expect(recoveredAddress).to.equal(signer.address);
    });
  });

  describe("Hashing using SHA-256", function () {
    it("Should correctly hash a number using SHA-256 via EVM precompile 0x02", async function () {
      const numberToHash = 12345;

      // Perform the hashing via the contract
      const contractHash = await evmPrecompiles.hashSha256(numberToHash);

      // Perform the hashing via ethers.js to compare
      const ethersHash = ethers.solidityPackedSha256(
        ["uint256"],
        [numberToHash]
      );

      expect(contractHash).to.equal(ethersHash);
    });
  });

  describe("Hashing using RIPEMD-160", function () {
    it("Should correctly hash data using RIPEMD-160 via EVM precompile 0x03", async function () {
      const data = ethers.toUtf8Bytes("Test Data");

      // Compute the RIPEMD-160 hash using ethers.js for comparison
      const expectedHash = ethers.ripemd160(data);

      // Call the contract function to compute the hash
      const contractHash = await evmPrecompiles.hashRIPEMD160(data);

      // Assert that the contract's hash matches the expected hash
      expect(contractHash).to.equal(expectedHash);
    });
  });

  describe("Datacopy (identity function)", function () {
    it("Should correctly copy the data using datacopy via EVM precompile 0x04", async function () {
      const inputData = ethers.toUtf8Bytes("Test Data for Datacopy");

      // Call the contract function to copy the data
      const transaction = await evmPrecompiles.callDatacopy(inputData);
      const receipt = await transaction.wait();
      const returnedData = receipt.logs[0].args[0];

      // Assert that the returned data matches the input data
      expect(returnedData).to.equal(ethers.hexlify(inputData));
    });
  });

  // --------------------------------------------------------------------------------- //
  //******** This precompile is still not supported on Neon Devnet and Mainnet and will fail *********
  describe("BigModExp function", function () {
    it("Should correctly calculate base^exponent % modulus using the BigModExp precompile 0x05", async function () {
      // Example values
      const base = ethers.zeroPadValue(ethers.toBeHex(2), 32); // Pad 2 to 32 bytes
      const exponent = ethers.zeroPadValue(ethers.toBeHex(10), 32); // Pad 10 to 32 bytes
      const modulus = ethers.zeroPadValue(ethers.toBeHex(100), 32); // Pad 1000 to 32 bytes

      // Call the contract function
      const transaction = await evmPrecompiles.callBigModExp(
        base,
        exponent,
        modulus
      );
      const receipt = await transaction.wait(3);
      const returnedData = receipt.logs[0].args[0];

      // Manually calculate the expected result (2^10 % 1000 = 24), padded to 32 bytes
      const expectedResult = ethers.zeroPadValue(
        ethers.toBeHex(2 ** 10 % 100),
        32
      );

      // Assert that the result matches the expected result
      expect(returnedData).to.equal(expectedResult);
    });
  });
  // ------------------------------------------------------------------------------------ //

  describe("bn256Add function", function () {
    it("Should correctly perform bn256 addition using the precompile 0x06", async function () {
      // Example points on the bn256 curve (use actual valid points for meaningful tests)
      const ax = ethers.zeroPadValue(ethers.toBeHex(1), 32);
      const ay = ethers.zeroPadValue(ethers.toBeHex(2), 32);
      const bx = ethers.zeroPadValue(ethers.toBeHex(1), 32);
      const by = ethers.zeroPadValue(ethers.toBeHex(2), 32);

      // Call the contract function and get the result
      const transaction = await evmPrecompiles.callBn256Add(ax, ay, bx, by);
      const receipt = await transaction.wait(3);
      const returnedData = receipt.logs[0].args[0];

      // Manually calculate the expected result (if known)
      // Replace with the actual expected result for these points if available
      const expectedResult = [
        "0x030644e72e131a029b85045b68181585d97816a916871ca8d3c208c16d87cfd3",
        "0x15ed738c0e0a7c92e7845f96b2ae9c0a68a6a449e3538fc7ff3ebf7a5a18a2c4",
      ];

      // Compare the result from the contract with the expected result
      expect(returnedData[0]).to.equal(expectedResult[0]);
      expect(returnedData[1]).to.equal(expectedResult[1]);
    });
  });

  describe("bn256ScalarMul function", function () {
    it("Should correctly perform bn256 scalar multiplication using the precompile 0x07", async function () {
      // Example point and scalar values (use actual valid points and scalars for meaningful tests)
      const x = ethers.zeroPadValue(ethers.toBeHex(1), 32); // Example x-coordinate
      const y = ethers.zeroPadValue(ethers.toBeHex(2), 32); // Example y-coordinate
      const scalar = ethers.zeroPadValue(ethers.toBeHex(3), 32); // Example scalar

      // Call the contract function and get the result
      const transaction = await evmPrecompiles.callBn256ScalarMul(x, y, scalar);
      const receipt = await transaction.wait(3);
      const returnedData = receipt.logs[0].args[0];

      // Manually calculate the expected result (if known)
      // Replace with the actual expected result for these inputs if available
      const expectedResult = [
        "0x0769bf9ac56bea3ff40232bcb1b6bd159315d84715b8e679f2d355961915abf0",
        "0x2ab799bee0489429554fdb7c8d086475319e63b40b9c5b57cdf1ff3dd9fe2261",
      ];

      // Compare the result from the contract with the expected result
      expect(returnedData[0]).to.equal(expectedResult[0]);
      expect(returnedData[1]).to.equal(expectedResult[1]);
    });
  });

  describe("bn256Pairing function", function () {
    it("Should correctly perform bn256 pairing using the precompile 0x08", async function () {
      const input =
        "0x2f2ea0b3da1e8ef11914acf8b2e1b32d99df51f5f4f206fc6b947eae860eddb6068134ddb33dc888ef446b648d72338684d678d2eb2371c61a50734d78da4b7225f83c8b6ab9de74e7da488ef02645c5a16a6652c3c71a15dc37fe3a5dcb7cb122acdedd6308e3bb230d226d16a105295f523a8a02bfc5e8bd2da135ac4c245d065bbad92e7c4e31bf3757f1fe7362a63fbfee50e7dc68da116e67d600d9bf6806d302580dc0661002994e7cd3a7f224e7ddc27802777486bf80f40e4ca3cfdb186bac5188a98c45e6016873d107f5cd131f3a3e339d0375e58bd6219347b008122ae2b09e539e152ec5364e7e2204b03d11d3caa038bfc7cd499f8176aacbee1f39e4e4afc4bc74790a4a028aff2c3d2538731fb755edefd8cb48d6ea589b5e283f150794b6736f670d6a1033f9b46c6f5204f50813eb85c8dc4b59db1c5d39140d97ee4d2b36d99bc49974d18ecca3e7ad51011956051b464d9e27d46cc25e0764bb98575bd466d32db7b15f582b2d5c452b36aa394b789366e5e3ca5aabd415794ab061441e51d01e94640b7e3084a07e02c78cf3103c542bc5b298669f211b88da1679b0b64a63b7e0e7bfe52aae524f73a55be7fe70c7e9bfc94b4cf0da1213d2149b006137fcfb23036606f848d638d576a120ca981b5b1a5f9300b3ee2276cf730cf493cd95d64677bbb75fc42db72513a4c1e387b476d056f80aa75f21ee6226d31426322afcda621464d0611d226783262e21bb3bc86b537e986237096df1f82dff337dd5972e32a8ad43e28a78a96a823ef1cd4debe12b6552ea5f";

      // Call the contract function
      const transaction = await evmPrecompiles.callBn256Pairing(input);
      const receipt = await transaction.wait(3);
      const returnedData = receipt.logs[0].args[0];

      // Expected result should be either 0 or 1 (depending on whether the pairing equation holds)
      const expectedResult = ethers.zeroPadValue(ethers.toBeHex(1), 32); // Example result: replace with actual expected output
      expect(returnedData).to.equal(expectedResult);
    });
  });

  describe("Blake2F function", function () {
    it("Should correctly call the Blake2F precompile 0x09", async function () {
      const rounds = 12;

      // Properly formatted 32-byte (256-bit) values for `h`
      const h = [
        "0x48c9bdf267e6096a3ba7ca8485ae67bb2bf894fe72f36e3cf1361d5f3af54fa5",
        "0xd182e6ad7f520e511f6c3e2b8c68059b6bbd41fbabd9831f79217e1319cde05b",
      ];

      // Properly formatted 32-byte (256-bit) values for `m`
      const m = [
        "0x6162630000000000000000000000000000000000000000000000000000000000",
        "0x0000000000000000000000000000000000000000000000000000000000000000",
        "0x0000000000000000000000000000000000000000000000000000000000000000",
        "0x0000000000000000000000000000000000000000000000000000000000000000",
      ];

      // Properly formatted 8-byte (64-bit) values for `t`, padded to 32 bytes
      const t = ["0x0000000003000000", "0x0000000000000000"];
      const f = true;

      // Call the contract function
      const transaction = await evmPrecompiles.callBlake2F(rounds, h, m, t, f);
      const receipt = await transaction.wait(3);
      const returnedData = receipt.logs[0].args[0];

      // Expected output based on the Blake2F function with these parameters
      // (Note: This expected output is just an example; adjust it based on actual expectations)
      const expectedOutput = [
        "0x11cdda1ff8cd8abddbe92e24c933f34d57308e77e42d6f197317b8b5716d423c", // Replace with actual expected bytes32 output
        "0x9c245993a48e02ca4ca103f177911200afb34c75ea6e7fdd13193fa919335237", // Replace with actual expected bytes32 output
      ];

      expect(returnedData[0]).to.equal(expectedOutput[0]);
      expect(returnedData[1]).to.equal(expectedOutput[1]);
    });
  });

  // --------------------------------------------------------------------------------- //
  //******** This precompile is still not supported on Neon Devnet and Mainnet and will fail *********
  describe("KZG proof function", function () {
    it("Should correctly call the precompiled contract 0x0a", async function () {
      const input =
        "0x01e798154708fe7789429634053cbf9f99b619f9f084048927333fce637f549b564c0a11a0f704f4fc3e8acfe0f8245f0ad1347b378fbf96e206da11a5d3630624d25032e67a7e6a4910df5834b8fe70e6bcfeeac0352434196bdf4b2485d5a18f59a8d2a1a625a17f3fea0fe5eb8c896db3764f3185481bc22f91b4aaffcca25f26936857bc3a7c2539ea8ec3a952b7873033e038326e87ed3e1276fd140253fa08e9fc25fb2d9a98527fc22a2c9612fbeafdad446cbc7bcdbdcd780af2c16a";

      // Call the callKzg function
      const transaction = await evmPrecompiles.callKzg(input);
      const receipt = await transaction.wait(3);
      const returnedData = receipt.logs[0].args[0];

      const expectedOutput =
        "0x000000000000000000000000000000000000000000000000000000000000100073eda753299d7d483339d80809a1d80553bda402fffe5bfeffffffff00000001";

      // Check the output
      expect(returnedData).to.equal(expectedOutput);
      expect(returnedData.length).to.equal(130); // 64 bytes output in hex (130 characters including 0x)*/
    });
  });
  // ------------------------------------------------------------------------------------ //
});
