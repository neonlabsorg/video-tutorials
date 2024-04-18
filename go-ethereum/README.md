# Ethereum-based dApp Development with Go using go-ethereum SDK

# Example deploying a simple storage contract to Neon EVM Devnet using Go

This directory contains all the files necessary to deploy simple storage contract on Neon EVM using Go. For more details, please refer to these documentations https://goethereumbook.org/en/ and https://geth.ethereum.org/docs/developers/dapp-developer/native-bindings.

## Prerequisites

To use this project, Go must be installed on the machine.

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

## Interact with the **Storage** smart contract

Run the following command to deploy the Storage contract, store a value in the deployed smart contract and reading the value from the deployed smart contract.

```sh
go run main.go
```

After successfully running this step you should get console output similar to:

```sh
You are now connected to Neon EVM Devnet
The NEON balance of the account is: 314473436236074797113362
Deploying Storage contract...
The contract is deployed at address:  0x259Ab4d9d645CFC89b7d340bAb926cD297952945
Transaction hash: 0x9f47e21b2515e8890ff51969f3cfb28ff448cc654fca80da978c55b892dff7b6

You are now connected to Neon EVM Devnet
The NEON balance of the account is: 314469132020646818818162
Storing value in the Storage contract...
Encoded data: 0x6057361d000000000000000000000000000000000000000000000000000000000000002d
Estimated gas: 25000
Transaction hash: 0x54fc126f2d04ad4432094f14bf60b15fc235b5667c40713e71699f28b6c300b4

You are now connected to Neon EVM Devnet
The NEON balance of the account is: 314469129760694164148162
Reading value from the Storage contract...
Returned value: 45
```
