import { ethers } from "hardhat";
import { networkConfig } from "../network.config";

async function main() {
  const network = await ethers.provider.getNetwork();
  console.log(`Deploying to ${network.name}`);

  let priceFeedAddress; // address of the price feed
  if (network.name === "localhost" || network.name === "hardhat") {
    // deploy mock for local testing
    const mockV3Aggregator = await ethers.deployContract(
      "MockAggregatorV3Interface",
      [300000000000]
    );

    await mockV3Aggregator.waitForDeployment();
    priceFeedAddress = mockV3Aggregator.target;
    console.log(
      `mockV3Aggregator is deployed to the network ${mockV3Aggregator.target}`
    );
  } else {
    priceFeedAddress = networkConfig[network.name].ethUsdPriceFeed;
  }

  const fundMe = await ethers.deployContract("FundMe", [priceFeedAddress]);
  await fundMe.waitForDeployment();

  console.log(`FundMe is deployed to the network ${fundMe.target}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
