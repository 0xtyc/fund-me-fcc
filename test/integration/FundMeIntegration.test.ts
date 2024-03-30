import { ethers, network } from "hardhat";
import { expect } from "chai";
import { FundMe } from "../../typechain-types";
import deployedAddress from "../../ignition/deployments/sepolia-deployment/deployed_addresses.json";

describe("Integration test for FundMe contract on Sepolia", function () {
  let fundMeContract: FundMe;
  before(async function () {
    if (network.name !== "sepolia") {
      this.skip();
    }
    // read the contract address deployed by ignition
    fundMeContract = await ethers.getContractAt(
      "FundMe",
      deployedAddress["FundMeModule#FundMe"]
    );
  });

  it("allows user to fund and withdraw", async function () {
    // test fund
    const initialBalance = await ethers.provider.getBalance(
      fundMeContract.target
    );
    const fundTxResponse = await fundMeContract.fund({
      value: ethers.parseEther("0.05"),
    });
    await fundTxResponse.wait(1);

    const finalBalance = await ethers.provider.getBalance(
      fundMeContract.target
    );
    const expectedBalance = initialBalance + ethers.parseEther("0.05");

    expect(finalBalance).to.equal(expectedBalance);

    // test withdraw
    const withdrawTxResponse = await fundMeContract.withdraw();
    await withdrawTxResponse.wait(1);

    const finalBalanceAfterWithdraw = await ethers.provider.getBalance(
      fundMeContract.target
    );
    expect(finalBalanceAfterWithdraw).to.equal(ethers.parseEther("0"));
  });
});
