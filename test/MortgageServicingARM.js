const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MortgageServicingARM", function () {
  let MortgageServicingARM;
  let mortgageServicingARM;
  let cpiOracle;
  let servicer;
  let originator;
  let msrHolder;
  let borrower;

  beforeEach(async function () {
    // Get signers
    [servicer, originator, msrHolder, borrower] = await ethers.getSigners();

    // Deploy the MortgageServicingARM contract
    MortgageServicingARM = await ethers.getContractFactory("MortgageServicingARM");
    mortgageServicingARM = await MortgageServicingARM.deploy(servicer.address, originator.address, cpiOracle.address);
    await mortgageServicingARM.deployed();
  });

  it("should originate a loan", async function () {
    const loanId = 1;
    const ipfsHash = "QmTest001"; // Example IPFS hash
    const amount = 100000
    const initialInterestRate = 200; // 2%
    const margin = 50; // 0.5%
    const lifetimeCap = 1000; // 10%
    const paymentDate = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60; // 30 days from now
    const adjustmentInterval = 365 * 24 * 60 * 60; // 1 year

    await expect(
      mortgageServicingARM.connect(servicer).originateLoan(
        loanId,
        ipfsHash,
        amount,
        initialInterestRate,
        margin,
        lifetimeCap,
        paymentDate,
        adjustmentInterval
      )
    )
    .to.emit(mortgageServicingARM, "LoanOriginated")
    .withArgs(loanId, ipfsHash);

    const loan = await mortgageServicingARM.loans(loanId);
    expect(loan.loanId).to.equal(loanId);
    expect(loan.amount).to.equal(amount);
    expect(loan.initialInterestRate).to.equal(initialInterestRate);
    expect(loan.margin).to.equal(margin);
    expect(loan.lifetimeCap).to.equal(lifetimeCap);
  });

  it("should adjust interest rate based on CPI", async function () {
    const loanId = 1;
    const ipfsHash = "QmTest001";
    const amount = 100000;
    const initialInterestRate = 200; // 5%
    const margin = 50; // 0.5%
    const lifetimeCap = 1000; // 10%
    const paymentDate = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60; // 30 days from now
    const adjustmentInterval = 365 * 24 * 60 * 60; // 1 year

    await mortgageServicingARM.connect(servicer).originateLoan(
      loanId,
      ipfsHash,
      amount,
      initialInterestRate,
      margin,
      lifetimeCap,
      paymentDate,
      adjustmentInterval
    );

    // Fast forward time to pass the adjustment interval
    await ethers.provider.send("evm_increaseTime", [adjustmentInterval]);
    await ethers.provider.send("evm_mine");

    await expect(mortgageServicingARM.connect(servicer).adjustInterestRate(loanId))
      .to.emit(mortgageServicingARM, "InterestRateAdjusted");

    const loan = await mortgageServicingARM.loans(loanId);
    const expectedNewRate = initialInterestRate + margin + ((3000 - 2500) * 10000) / 2500;
    expect(loan.adjustedInterestRate).to.equal(expectedNewRate);
  });

  it("should process a payment", async function () {
    const loanId = 1;
    const ipfsHash = "QmTest001";
    const amount = 100000;
    const initialInterestRate = 200; // 5%
    const margin = 50; // 0.5%
    const lifetimeCap = 1000; // 10%
    const paymentDate = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60; // 30 days from now
    const adjustmentInterval = 365 * 24 * 60 * 60; // 1 year

    await mortgageServicingARM.connect(servicer).originateLoan(
      loanId,
      ipfsHash,
      amount,
      initialInterestRate,
      margin,
      lifetimeCap,
      paymentDate,
      adjustmentInterval
    );

    const paymentAmount = ethers.utils.parseEther("110");
    await expect(mortgageServicingARM.connect(borrower).makePayment(loanId, { value: paymentAmount }))
      .to.emit(mortgageServicingARM, "PaymentReceived")
      .and.to.emit(mortgageServicingARM, "ServiceFeePaid");

    const loan = await mortgageServicingARM.loans(loanId);
    expect(loan.isPaid).to.be.true;
  });

  it("should update service fee rate with originator's signature", async function () {
    const newRate = ethers.utils.parseEther("0.01");
    const messageHash = ethers.utils.solidityKeccak256(["uint256", "address"], [newRate, mortgageServicingARM.address]);
    const signature = await originator.signMessage(ethers.utils.arrayify(messageHash));

    await expect(mortgageServicingARM.connect(msrHolder).updateServiceFeeRate(newRate, signature))
      .to.emit(mortgageServicingARM, "ServiceFeeRateUpdated")
      .withArgs(newRate);

    expect(await mortgageServicingARM.serviceFeeRate()).to.equal(newRate);
  });

  it("should change MSR holder", async function () {
    await expect(mortgageServicingARM.connect(msrHolder).setMSRHolder(borrower.address))
      .to.emit(mortgageServicingARM, "MSRHolderChanged")
      .withArgs(borrower.address);

    expect(await mortgageServicingARM.msrHolder()).to.equal(borrower.address);
  });
});
