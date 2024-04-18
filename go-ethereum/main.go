package main

import "go-ethereum/deploy"

func main() {
	contractAddress := deploy.DeployStorageContract()
	deploy.WriteStorageContract(contractAddress, 45)
	deploy.ReadStorageContract(contractAddress)
}