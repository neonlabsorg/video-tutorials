package deploy

import (
	"context"
	"fmt"
	"log"
	"math/big"

	"go-ethereum/connection"
	"go-ethereum/contractsgo"

	"github.com/defiweb/go-eth/abi"
	"github.com/defiweb/go-eth/hexutil"
	"github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/ethclient"
)

// GetNextTransaction returns the next transaction in the pending transaction queue
// NOTE: this is not an optimized way
func GetNextTransaction() (*bind.TransactOpts, *ethclient.Client, common.Address, uint64, *big.Int, error) {
	client, chainID, fromAddress, privateKey := connection.Connection()
    
    nonce, err := client.PendingNonceAt(context.Background(), fromAddress)
    if err != nil {
        log.Fatal(err)
    }

    gasPrice, err := client.SuggestGasPrice(context.Background())
    if err != nil {
        log.Fatal(err)
    }

	// sign the transaction
	auth, err := bind.NewKeyedTransactorWithChainID(privateKey, chainID)
	if err != nil {
		return nil, client, fromAddress, nonce, gasPrice, err
	}

	return auth, client, fromAddress, nonce, gasPrice, nil
}

func DeployStorageContract() (string) {
	auth, client, fromAddress, nonce, gasPrice, _ := GetNextTransaction()

	fmt.Println("Deploying Storage contract...")

	auth.From = fromAddress
	auth.Nonce = big.NewInt(int64(nonce))
	auth.Value = big.NewInt(0)             // in wei
	auth.GasLimit = uint64(30000000)        // in units
	auth.GasPrice = gasPrice // in wei

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

func WriteStorageContract(contractAddress string, value int64) {
	auth, client, fromAddress, nonce, gasPrice, _ := GetNextTransaction()

	fmt.Println("Storing value in the Storage contract...")

	store := abi.MustParseMethod("store(uint256)")
	// Encode method arguments.
	abiData, err := store.EncodeArgs(
		big.NewInt(value))
	if err != nil {
		panic(err)
	}
	// Print encoded data.
	fmt.Printf("Encoded data: %s\n", hexutil.BytesToHex(abiData))

	toAddress := common.HexToAddress(contractAddress) //"0xa0D774bbf8193388f98D7FDfA763e6B3f41A8E56"

	callMsg := ethereum.CallMsg {
		From: fromAddress,
		To: &toAddress,
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
	auth.Value = big.NewInt(0)             // in wei
	auth.GasLimit = gasLimit       // in units
	auth.GasPrice = gasPrice // in wei

	// Call the store() function
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

func ReadStorageContract(contractAddress string) {
	_, client, _, _, _, _ := GetNextTransaction()

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
}