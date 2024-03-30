# Hardhat FundMe Project

This repository is developed following the [Solidity tutorial from freeCodeCamp](https://youtu.be/gyMwXuJrbJQ?si=6r_xBj6SATtdgc5p). The project demonstrates the use of Hardhat to write, test, and deploy smart contracts with Typescript.

The FundMe contract allows users to contribute funds and the contract owner to withdraw the funds. This project is a note for me to learn the workflow of Ethereum smart contract development.

## Smart Contract Development flow

1. Init the project from hardhat.
2. Write your contracts in `/contracts`, and compile them when they are updated.
   - `npx hardhat compile`
3. Start a local network for development.
   - `npx hardhat node`
4. Deploy the contract to the local network with the given script.
   - `npx hardhat run scripts/deploy.ts --network localhost`
5. Write unit tests in `/test`. If a contract uses an oracle, a mock contract must be deployed for local testing.
   - `npx hardhat test` to run tests
   - `npx hardhat coverage` to check test coverage
6. Setup a wallet in the testnet, and get some funds from a faucet for deployment. Configure your account **securely** in the `hardhat.config.ts`.
7. Get an API key from [etherscan](https://etherscan.io/) and add it to the config for contract verification.
8. Deploy and verify the contract with `ignition` to testnet (sepolia)
   - `npx hardhat ignition deploy ignition/modules/FundMe.ts --network sepolia --verify`
9. Add an integration test on the testnet.
   - `npx hardhat test --network sepolia`

## Frontend usage

To interact with this contract in frontend with `ethers`, the contract address and ABI are necessary, and they can be found under the `ignition/deployments/sepolia-deployment`
