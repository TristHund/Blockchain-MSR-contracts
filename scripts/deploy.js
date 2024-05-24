const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const balance = await deployer.getBalance();
  console.log("Account balance:", balance.toString());

  // Deploy MockCPIOracle
  const MockCPIOracle = await ethers.getContractFactory("MockCPIOracle");
  const mockCPIOracle = await MockCPIOracle.deploy();
  await mockCPIOracle.deployed();
  console.log("MockCPIOracle contract address:", mockCPIOracle.address);

  // Deploy MortgageServicingARM using the address of the MockCPIOracle
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
