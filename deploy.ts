import { Lockup } from './src/contracts/lockup'
import { bsv, TestWallet, DefaultProvider } from 'scrypt-ts'

import * as dotenv from 'dotenv'

// Load the .env file
dotenv.config()

// Read the private key from the .env file.
// The default private key inside the .env file is meant to be used for the Bitcoin testnet.
// See https://scrypt.io/docs/bitcoin-basics/bsv/#private-keys
const privateKey = bsv.PrivateKey.fromWIF(process.env.PRIVATE_KEY || '')

// Prepare signer.
// See https://scrypt.io/docs/how-to-deploy-and-call-a-contract/#prepare-a-signer-and-provider
const signer = new TestWallet(
    privateKey,
    new DefaultProvider({
        network: bsv.Networks.mainnet,
    })
)

async function main() {
    await Lockup.compile()

    // TODO: Adjust the amount of satoshis locked in the smart contract:
    const amount = 1
    const pubKeyHash = bsv.crypto.Hash.sha256ripemd160(
        bsv.PublicKey.fromPrivateKey(privateKey).toBuffer()
    )

    const instance = new Lockup(
        pubKeyHash,
        500000000n // lockUntilHeight
    )
    // Connect to a signer.
    await instance.connect(signer)

    // Contract deployment.
    const deployTx = await instance.deploy(amount)
    console.log(`Lockup contract deployed: ${deployTx.id}`)
}

main()
