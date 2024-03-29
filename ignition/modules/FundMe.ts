import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { network } from "hardhat";
import { networkConfig } from "../../network.config";

const FundMeModule = buildModule("FundMeModule", (m) => {
  const fundMe = m.contract("FundMe", [
    networkConfig[network.name].ethUsdPriceFeed,
  ]);

  return { fundMe };
});

export default FundMeModule;
