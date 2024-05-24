# MSR ARM Smart Contracts

This repository contains the smart contracts and related code for setting up Adjustable Rate Mortgage (ARM) contracts. The contracts are designed to facilitate mortgage servicing rights (MSR) and provide functionalities for borrowers, servicers, and originators.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Smart Contracts](#smart-contracts)
  - [MortgageServicingARM](#mortgageservicingarm)
- [Deployment](#deployment)
- [Testing](#testing)
- [Usage](#usage)
  - [Borrower](#borrower)
  - [Servicer](#servicer)
  - [Originator](#originator)
- [Contributing](#contributing)
- [License](#license)

## Overview

The MSR ARM Smart Contracts project aims to provide a decentralized solution for managing Adjustable Rate Mortgages. The contracts handle loan origination, interest rate adjustments, and payment processing, ensuring transparency and efficiency in mortgage servicing.

## Features

- **Loan Origination**: Originators can create new ARM loans.
- **Interest Rate Adjustment**: Automatically adjusts the interest rate based on predefined intervals and CPI data.
- **Payment Processing**: Allows borrowers to make payments, and updates the unpaid principal balance (UPB) accordingly.
- **MSR Management**: Facilitates the transfer and management of mortgage servicing rights.

## Getting Started

### Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)
- [Hardhat](https://hardhat.org/)

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

### MortgageServicingARM

The main contract for managing ARM loans and mortgage servicing rights. Key functions include:

- `originateLoan()`: Originate a new loan.
- `adjustInterestRate()`: Adjust the interest rate based on CPI data.
- `makePayment()`: Allow borrowers to make payments and update the loan status.
- `resetPaymentStatus()`: Reset the payment status for the next month.

## Deployment

To deploy the smart contracts to a blockchain network, use the Hardhat deployment scripts. Ensure you have configured your network settings in `hardhat.config.js`.

```bash
npx hardhat compile
npx hardhat run scripts/deploy.js --network <network-name>
```

## Testing

Run the tests to ensure the contracts work as expected:

```bash
npx hardhat test
```

## Usage

### Borrower

Borrowers can interact with the contract to make payments. Ensure you have the necessary funds in your wallet before making a transaction.

### Servicer

Servicers can adjust interest rates and reset payment statuses. They must verify actions using signatures to ensure security.

### Originator

Originators can create new loans and manage the initial setup of the ARM contracts.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request with your improvements or bug fixes.

## License

This project is licensed under the MIT License.
