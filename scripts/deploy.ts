import { ethers } from "hardhat";

async function main() {
  const fundMe = await ethers.deployContract("FundMe");

  await fundMe.waitForDeployment();

  console.log(`FundMe is deployed to the network ${fundMe.target}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
