package deploy

import (
	"context"
	"fmt"
	"log"
	"math/big"

	"go-ethereum/connection"
	"go-ethereum/contractsgo"

	"github.com/defiweb/go-eth/abi"
	"github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
)

func DeployStorageContract() (string) {
	auth, client, fromAddress, nonce, gasPrice, _ := connection.GetNextTransaction()

	fmt.Println("Deploying Storage contract...")

	auth.From = fromAddress
	auth.Nonce = big.NewInt(int64(nonce))
	auth.Value = big.NewInt(0)
	auth.GasLimit = uint64(30000000)
	auth.GasPrice = gasPrice

	address, tx, _, err := contractsgo.DeployStorage(auth, client)
    if err != nil {
        log.Fatal(err)
    }

	_, err = bind.WaitDeployed(context.Background(), client, tx)
    if err != nil {
        log.Fatal(err)
    }

    fmt.Println("The contract is deployed at address: ", address)
	fmt.Printf("Transaction hash: 0x%x\n\n", tx.Hash())

	return address.String()
}

func StoreValue(contractAddress string, value int64) {
	auth, client, fromAddress, nonce, gasPrice, _ := connection.GetNextTransaction()

	fmt.Println("Storing value in the Storage contract...")

	store := abi.MustParseMethod("store(uint256)")
	// Encode method arguments.
	abiData, err := store.EncodeArgs(
		big.NewInt(value))
	if err != nil {
		panic(err)
	}

	toContractAddress := common.HexToAddress(contractAddress)

	callMsg := ethereum.CallMsg {
		From: fromAddress,
		To: &toContractAddress,
		GasPrice: gasPrice,
        Value: big.NewInt(0),
		Data: abiData,
	}

	gasLimit, err := client.EstimateGas(context.Background(), callMsg) // nil is latest block
    if err != nil {
        log.Fatal(err)
    }
	fmt.Println("Estimated gas:", gasLimit)

	storage, err := contractsgo.NewStorage(common.HexToAddress(contractAddress), client)
	if err != nil {
		log.Fatalf("Failed to instantiate Storage contract: %v", err)
	}

	auth.From = fromAddress
	auth.Nonce = big.NewInt(int64(nonce))
	auth.Value = big.NewInt(0)
	auth.GasLimit = gasLimit
	auth.GasPrice = gasPrice

	// Call the store function from the smart contract
	tx, err := storage.Store(auth, big.NewInt(value))
	if err != nil {
		log.Fatalf("Failed to update value: %v", err)
	}
	
	_, err = bind.WaitMined(context.Background(), client, tx)
    if err != nil {
        log.Fatal(err)
    }
	fmt.Printf("Transaction hash: 0x%x\n\n", tx.Hash())	
}

func ReadValue(contractAddress string) {
	_, client, _, _, _, _ := connection.GetNextTransaction()

	fmt.Println("Reading value from the Storage contract...")

	storage, err := contractsgo.NewStorage(common.HexToAddress(contractAddress), client)
	if err != nil {
		log.Fatalf("Failed to instantiate Storage contract: %v", err)
	}

	value, err := storage.Retrieve(&bind.CallOpts{})
	if err != nil {
		log.Fatalf("Failed to retrieve value: %v", err)
	}
	fmt.Println("Returned value:", value)
	fmt.Println()
}