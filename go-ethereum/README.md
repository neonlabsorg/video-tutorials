# Ethereum-based dApp Development with Go using go-ethereum SDK

# Examples deploying smart contracts on Neon EVM Devnet using Go

This directory contains all the files necessary to deploy the following smart contracts on Neon EVM Devnet-

1. Simple storage contract.
2. ERC20 token contract.

For more details, please refer to these documentations https://goethereumbook.org/en/ and https://geth.ethereum.org/docs/developers/dapp-developer/native-bindings.

## Prerequisites

1. The latest Go version.
2. Solidity compiler version <= 0.8.24 (Neon EVM supports solidity <= 0.8.24).

### Solc installation

Check this link to install the required solc version - https://docs.soliditylang.org/en/latest/installing-solidity.html.

### Go installation

1. Download the latest Go version from https://go.dev/doc/install.
2. Make a directory `GoProjects` for your Go project development in your machine.
3. Make 3 directories `/GoProjects/src`, `/GoProjects/pkg` and `/GoProjects/bin`.
4. Set up the GOPATH env variable in your `.bash_profile` or `.zshrc` file -

```sh
export GOPATH=<PATH_TO_YOUR_GO_PROJECTS_DIRECTORY>
export PATH=$GOPATH/bin:$PATH
```

5. Save your `.bash_profile` or `.zshrc` file.

```sh
source .bash_profile
```

OR

```sh
source .zshrc
```

6. Run `echo $GOPATH` to check if the GOPATH is set correctly in the machine.

:::important
Neon EVM doesn't support the latest JSON-RPC specifications. Therefore Neon EVM only supports `go-ethereum` versions **<=1.12.2**.
:::

## Cloning repository

Run command

```sh
git clone https://github.com/neonlabsorg/neon-tutorials.git
```

**NOTE:** Please copy the directory `go-ethereum` and place it inside your `GoProjects/src` directory (Go applications run from inside the GOPATH).

## Install the required libraries

```sh
go install github.com/ethereum/go-ethereum/cmd/abigen@latest
go mod tidy
```

## Set up .env file

Rename `.env.example` to `.env` and place your private key inside it.

> [!IMPORTANT]
> If you want to deploy only one of the smart contracts, then please comment out the other smart contract function calls in the `main.go` file.

## Interact with the **Storage** smart contract

Run the following command to deploy the Storage contract, store a value in the deployed smart contract and reading the value from the deployed smart contract.

```sh
go run main.go
```

After successfully running this step you should get console output similar to:

```sh
You are now connected to Neon EVM Devnet
The NEON balance of the account is: 310387553758242748088682
------------------------------------------------------------------------
Deploying Storage contract...
The contract is deployed at address:  0x6b6Ba862e2bBc0C1305DF681d45f16a1D6F57baf
Transaction hash: 0xf84667ce0bd5d2da4dfcf81fe9c72bdc81c207a41a3c9baa4c43e9ebb6ae1b6e

You are now connected to Neon EVM Devnet
The NEON balance of the account is: 310383249542814769793482
------------------------------------------------------------------------
Storing value in the Storage contract...
Estimated gas: 25000
Transaction hash: 0x24e5af83df1e9f1536d684c08e903d1285f1f5e484df43d4616c925bb25ec9a9

You are now connected to Neon EVM Devnet
The NEON balance of the account is: 310383247282862115123482
------------------------------------------------------------------------
Reading value from the Storage contract...
Returned value: 45
```

## Interact with the **TestERC20** smart contract

Run the following command to deploy the Test ERC20 token contract, store a value in the deployed smart contract and reading the value from the deployed smart contract.

```sh
go run main.go
```

After successfully running this step you should get console output similar to:

```sh
You are now connected to Neon EVM Devnet
The NEON balance of the account is: 310383247282862115123482
------------------------------------------------------------------------
Deploying TestERC20 contract...
The contract is deployed at address:  0x7BeE8180c4f35744C9cC811e540252ECcD8AcEb4
Transaction hash: 0xf8af65bcb8187bcdcc8c7a5a7106f242c941d6506201497f31f46099d891bcc6

You are now connected to Neon EVM Devnet
The NEON balance of the account is: 310373551028315738437922
------------------------------------------------------------------------
Transferring TestERC20 tokens...
Estimated gas: 1422000
Sender balance before transfer 1000000000000000000000
Receiver balance before transfer 0
Transaction hash: 0x8d2ff2a94f836b25e3ae9cc2f9b95ca73e3b3c1e4a6bf7725890eddd915029ab

Sender balance after transfer 999999999999999999990
Receiver balance after transfer 10
```

<br><br><br>

## Steps to deploy your own smart contract and generate the go bindings

1. Place your smart contract in the `contracts` directory.

2. Generate ABI for the smart contract.

```sh
solc --abi ./contracts/Example.sol -o build
```

3. Generate bytecode for the smart contract.

```sh
solc --bin ./contracts/Example.sol -o build
```

4. Generate the go binding for the smart contract.

```sh
abigen --abi ./build/Example.abi --pkg contractsgo --type Example --out ./contractsgo/Example.go --bin ./build/Example.bin
```
