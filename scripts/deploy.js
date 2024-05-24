const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const balance = await deployer.getBalance();
  console.log("Account balance:", balance.toString());

  // Deploy MockCPIDatafeed
  const MockCPIDatafeed = await ethers.getContractFactory("MockCPIDatafeed");
  const mockCPIDatafeed  = await MockCPIDatafeed.deploy();
  await mockCPIDatafeed .deployed();
  console.log("MockCPIDatafeed contract address:", mockCPIDatafeed.address);

  // Deploy MortgageServicingARM using the address of the MockCPIDatafeed
  const MortgageServicingARM = await ethers.getContractFactory("MortgageServicingARM");
  const mortgageServicingARM = await MortgageServicingARM.deploy(deployer.address, deployer.address, mockCPIOracle.address);
  await mortgageServicingARM.deployed();
  console.log("MortgageServicingARM contract address:", mortgageServicingARM.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
