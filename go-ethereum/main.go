package main

import "go-neon-devnet/deploy"

func main() {
	contractAddress := deploy.DeployStorageContract()
	deploy.WriteStorageContract(contractAddress, 45)
	deploy.ReadStorageContract(contractAddress)
}