# MSR ARM Smart Contracts

This repository contains the smart contracts and related code for setting up Adjustable Rate Mortgage (ARM) contracts. The contracts are designed to facilitate mortgage servicing rights (MSR) and provide functionalities for borrowers, servicers, and originators. This project was started with the intention of participating in the Chainlink Spring Hackathon 2024.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Smart Contracts](#smart-contracts)
  - [MortgageServicingARM](#mortgageservicingarm)
  - [MockCPIDatafeed](#mockcpidatafeed)
- [Deployment](#deployment)
- [Testing](#testing)
- [Usage](#usage)
  - [Borrower](#borrower)
  - [Servicer](#servicer)
  - [Originator](#originator)
- [Contributing](#contributing)
- [License](#license)

## Overview

This repo is part of the Armserv project which aims to provide a decentralized solution for managing Adjustable Rate Mortgages on the blockchain (and to extend into other types of mortgages as well). The contracts handle loan origination, interest rate adjustments, and payment processing, ensuring transparency and efficiency in mortgage servicing or ARM loans

## Features

- **Loan Origination**: Originators can create new ARM loans with very basic default features such as the interval of interest rate adjustment.

- **Interest Rate Adjustment**: Automatic adjustment of the interest rate based on predefined intervals and CPI data.

- **Payment Processing**: Servicer processing the loan payment onto the blockchain and updates the unpaid principal balance (UPB) accordingly.

- **MSR Management**: Facilitates the transfer and management of mortgage servicing rights from an originator to a servicer or between servicers. 

## Getting Started

### Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)
- [Hardhat](https://hardhat.org/)


**Please Note** hardhat local testing is still under-development and I have opted mainly for testing on remix using the Sepolia network.

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/msr-arm-smart-contracts.git
cd msr-arm-smart-contracts
```

2. Install dependencies:

```bash
npm install
```

## Smart Contracts 

## MortgageServicingARM

The main contract for managing ARM loans and mortgage servicing rights. 

Key functions include:

### originateLoan() 
Originates a new loan using the following parametes:

  - **loanId** - The identifying number for the loan (_Any integer Value_)

  - **ipfsHash** - (under development) This is a hash that links to a location where additional off chain loan data will be available. Currently I am using test strings but this will may be some location on IPFS or another resource offchain where perhaps more sensitive borrower data can be safely stored (_some string value_)

  - **amount** - Amount of the loan (_dollar amount 100000 for $100,000.00_)

  - **initialInterestRate** - The starting interest rate for the loan (**Basis Points(BPS)** - _This value is a standard unit of measurment in finance where 1 point is equal to 1/100th of a percent. For example if you use the value 200 here that would be equal to 2%_)

  - **margin** - The adjustment in percentage in this contract is based on an index set by the CPI value with the added contractual margin (value set by originator to add to the index) set on loan origination. (_BPS_)

  - **lifetimeCap** - This is the capped percentage amount on the loan, meaning the loan will never exceed this percentage amount once achieved. (_BPS_)

  - **paymentDate** - Date of last payment (_Unix Epoch Time, where 1719763200 would be June 30 2024_)

  - **dueDate** Date of next payment due (_Unix Epoch Time_)

  - **adjustmentInterval** - Time between rate adjustments (_Unix time where 31556926 would be 1 year_)


### adjustInterestRate()

Adjusts the interest rate of a loan on chain based on CPI data and margin.

### makePayment()

Allow servicer to process payments on chain and update the loan status.

### resetPaymentStatus()

Resets the payment status for the next month.

## MockCPIDatafeed

This is a smart contract that emulates the Chainlink Datafeed for CPI. This is critical in the rate adjustment calculation.

## Deployment

To deploy the smart contracts to a blockchain network, use the Hardhat deployment scripts. Ensure you have configured your network settings in `hardhat.config.js`.

```bash
npx hardhat compile
npx hardhat run scripts/deploy.js --network <network-name>
```

Alternatively can deploy through remix.

## Testing

Run the tests to ensure the contracts work as expected:

```bash
npx hardhat test
```

For more manual testing which I have been doing, deploy and test through functions on remix

## Usage

### Borrower

Borrowers can interact with the contract to check on chain loan data to ensure transarency and accountability of the servicer(s) and originator.

### Servicer

Servicers can adjust interest rates and process payments on chain as well as transfer servicing rights. They must verify actions using signatures to ensure security.

### Originator

Originators can create new loans and manage the initial setup of the ARM contracts and servicing rights deligation.

## Contributing

Contributions are welcome! This is a project meant to explore how to integrate defi and blockchain ledgers into traditional finance to transform and innovate on how things get done. Please open an issue or submit a pull request with your improvements or bug fixes.

## License

This project is licensed under the MIT License.
