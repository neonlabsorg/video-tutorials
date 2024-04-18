package connection

import (
	"context"
	"crypto/ecdsa"
	"fmt"
	"log"
	"math/big"
	"os"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/joho/godotenv"
)

func GoDotEnvVariable(key string) string {

    // load .env file
    err := godotenv.Load(".env")
  
    if err != nil {
      log.Fatalf("Error loading .env file")
    }
  
    return os.Getenv(key)
}

func Connection() (*ethclient.Client, *big.Int, common.Address, *ecdsa.PrivateKey) {
    client, err := ethclient.Dial("https://devnet.neonevm.org")
    if err != nil {
        log.Fatal(err)
    }

    chainID, err := client.NetworkID(context.Background())
    if err != nil {
        log.Fatal(err)
    }

    fmt.Println("You are now connected to Neon EVM Devnet")

    privateKeyFromEnv := GoDotEnvVariable("PRIVATE_KEY")

    privateKey, err := crypto.HexToECDSA(privateKeyFromEnv)
    if err != nil {
        log.Fatal(err)
    }

    publicKey := privateKey.Public()
    publicKeyECDSA, ok := publicKey.(*ecdsa.PublicKey)
    if !ok {
        log.Fatal("cannot assert type: publicKey is not of type *ecdsa.PublicKey")
    }

    fromAddress := crypto.PubkeyToAddress(*publicKeyECDSA)

    balance, err := client.BalanceAt(context.Background(), fromAddress, nil)
    if err != nil {
        log.Fatal(err)
    }
    fmt.Println("The NEON balance of the account is:", balance)

    return client, chainID, fromAddress, privateKey
}