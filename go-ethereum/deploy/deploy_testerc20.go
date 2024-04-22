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

func DeployTestERC20Contract() (string) {
	auth, client, fromAddress, nonce, gasPrice, _ := connection.GetNextTransaction()

	fmt.Println("Deploying TestERC20 contract...")

	auth.From = fromAddress
	auth.Nonce = big.NewInt(int64(nonce))
	auth.Value = big.NewInt(0)
	auth.GasLimit = uint64(300000000)
	auth.GasPrice = gasPrice

	address, tx, _, err := contractsgo.DeployTestERC20(auth, client)
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

func TransferTokens(contractAddress string, value int64) {
	auth, client, fromAddress, nonce, gasPrice, _ := connection.GetNextTransaction()
	toAddress := connection.GenerateNewWallet()

	fmt.Println("Transferring TestERC20 tokens...")

	store := abi.MustParseMethod("transfer(address,uint256)")
	// Encode method arguments.
	abiData, err := store.EncodeArgs(toAddress, big.NewInt(value))
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

	gasLimit, err := client.EstimateGas(context.Background(), callMsg)
    if err != nil {
        log.Fatal(err)
    }
	fmt.Println("Estimated gas:", gasLimit)

	testERC20, err := contractsgo.NewTestERC20(common.HexToAddress(contractAddress), client)
	if err != nil {
		log.Fatalf("Failed to instantiate TestERC20 contract: %v", err)
	}

	auth.From = fromAddress
	auth.Nonce = big.NewInt(int64(nonce))
	auth.Value = big.NewInt(0)
	auth.GasLimit = gasLimit
	auth.GasPrice = gasPrice

	testERC20BalanceOfSender, _ := testERC20.BalanceOf(&bind.CallOpts{}, fromAddress)
	fmt.Println("Sender balance before transfer", testERC20BalanceOfSender);

	testERC20BalanceOfReceiver, _ := testERC20.BalanceOf(&bind.CallOpts{}, toAddress)
    fmt.Println("Receiver balance before transfer", testERC20BalanceOfReceiver);

	// Call the transfer function from the smart contract
	tx, err := testERC20.Transfer(auth, toAddress, big.NewInt(value))
	if err != nil {
		log.Fatalf("Failed to transfer tokens: %v", err)
	}
	
	_, err = bind.WaitMined(context.Background(), client, tx)
    if err != nil {
        log.Fatal(err)
    }
	fmt.Printf("Transaction hash: 0x%x\n\n", tx.Hash())
	
	testERC20BalanceOfSender, _ = testERC20.BalanceOf(&bind.CallOpts{}, fromAddress)
	fmt.Println("Sender balance after transfer", testERC20BalanceOfSender);

	testERC20BalanceOfReceiver, _ = testERC20.BalanceOf(&bind.CallOpts{}, toAddress)
    fmt.Println("Receiver balance after transfer", testERC20BalanceOfReceiver);
}
