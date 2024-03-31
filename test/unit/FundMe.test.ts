import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers, network } from "hardhat";

describe("fundMe", function () {
  // We define a fixture to reuse the same setup in every test.
  // and reset Hardhat Network to that snapshot in every test.

  this.beforeAll(async function () {
    if (network.name !== "localhost" && network.name !== "hardhat") {
      console.log("These tests are meant to be run on localhost or hardhat");
      this.skip();
    }
  });

  async function deployFundMe() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const priceFeed = await ethers.getContractFactory(
      "MockAggregatorV3Interface"
    );
    const mockPriceFeed = await priceFeed.deploy(300000000000);

    const FundMe = await ethers.getContractFactory("FundMe");
    const fundMe = await FundMe.deploy(mockPriceFeed.target);

    return { fundMe, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { fundMe, owner } = await loadFixture(deployFundMe);

      expect(await fundMe.getOwner()).to.equal(owner.address);
    });
  });

  describe("Funding", function () {
    it("Should fund the contract and keep track of the founder", async function () {
      const { fundMe, owner } = await loadFixture(deployFundMe);
      const amountToSend = ethers.parseEther("1");

      await fundMe.fund({ value: amountToSend });

      const balance = await fundMe.s_addressToAmountFunded(owner.address);
      expect(balance).to.equal(amountToSend);

      const funderAddress = await fundMe.s_funders(0);
      expect(funderAddress).to.equal(owner.address);
    });

    it("Should revert if the funding amount is less than the minimum", async function () {
      const { fundMe, owner } = await loadFixture(deployFundMe);
      const amountToSend = ethers.parseEther("0.001"); // Less than the minimum required

      expect(
        fundMe.connect(owner).fund({ value: amountToSend })
      ).to.be.revertedWith("FundMe__InsufficientFunds");
    });

    it("Should return the correct funder amount", async function () {
      const { fundMe, otherAccount } = await loadFixture(deployFundMe);
      const amountSentFirst = ethers.parseEther("1");
      const amountSentSecond = ethers.parseEther("2");

      await fundMe.connect(otherAccount).fund({ value: amountSentFirst });
      await fundMe.connect(otherAccount).fund({ value: amountSentSecond });

      const balance = await fundMe.getFunderAmount(otherAccount.address);
      expect(balance).to.equal(amountSentFirst + amountSentSecond);
    });
  });

  describe("Withdrawals", function () {
    it("Should revert with the right error if called from another account", async function () {
      const { fundMe, otherAccount } = await loadFixture(deployFundMe);

      // We use fundMe.connect() to send a transaction from another account
      expect(fundMe.connect(otherAccount).withdraw()).to.be.revertedWith(
        "FundMe_NotOwner"
      );
    });
  });

  it("Should withdraw the funds and reset the value in addresToAmountFunded to zero", async function () {
    const { fundMe, owner } = await loadFixture(deployFundMe);
    const amountToSend = ethers.parseEther("1");

    await fundMe.fund({ value: amountToSend });

    const balanceBefore = await ethers.provider.getBalance(owner.address);
    await fundMe.withdraw();
    const balanceAfter = await ethers.provider.getBalance(owner.address);

    expect(balanceAfter).to.be.gt(balanceBefore);
    expect(await fundMe.s_addressToAmountFunded(owner.address)).to.equal(0);
  });

  describe("Events", function () {
    it("Should emit an event on withdrawals", async function () {
      const { fundMe } = await loadFixture(deployFundMe);

      await expect(fundMe.withdraw()).to.emit(fundMe, "Withdrawal").withArgs();
    });
  });
});
