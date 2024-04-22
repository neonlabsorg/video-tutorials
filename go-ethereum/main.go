package main

import "go-ethereum/deploy"

func main() {
	// Storage contract
	storageContractAddress := deploy.DeployStorageContract()
	deploy.StoreValue(storageContractAddress, 45)
	deploy.ReadValue(storageContractAddress)

	// TestERC20 contract
	testERC20ContractAddress := deploy.DeployTestERC20Contract()
	deploy.TransferTokens(testERC20ContractAddress, 10)	
}