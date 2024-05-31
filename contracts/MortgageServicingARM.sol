// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract MortgageServicingARM {

    address public servicer;
    address public originator;
    address public msrHolder;

    AggregatorV3Interface internal cpiValue;

    struct Loan {
        uint256 loanId;
        string ipfsHash;
        uint256 amount;
        uint256 initialInterestRate;
        uint256 adjustedInterestRate;
        uint256 margin;
        uint256 lifetimeCap;
        uint256 upb;
        uint256 paymentDate;
        uint256 dueDate;
        uint256 adjustmentInterval;
        uint256 lastAdjustmentDate;
        bool isPaid;
    }

    mapping(uint256 => Loan) public loans;

    uint256 public serviceFeeRate = 0.005 * 1e18;

    event LoanOriginated(uint256 loanId, string ipfsHash);
    event PaymentReceived(uint256 loanId, uint256 amount, uint256 serviceFee, uint256 principalPaid, uint256 interestPaid);
    event ServiceFeePaid(address msrHolder, uint256 amount);
    event InterestRateAdjusted(uint256 loanId, uint256 newRate);
    event MSRHolderChanged(address newMSRHolder);
    event ServiceFeeRateUpdated(uint256 newRate);
    event ResetPaymentStatus(string message, uint256 loanId);

    modifier onlyServicer() {
        require(msg.sender == servicer, "Only servicer can call this function");
        _;
    }

    modifier onlyMSRHolder() {
        require(msg.sender == msrHolder, "Only the current MSR holder can call this function");
        _;
    }

    modifier onlyOriginator() {
        require(msg.sender == originator, "Only the originator can call this function");
        _;
    }

    constructor(address _servicer, address _originator) {
        servicer = _servicer;
        originator = _originator;
        msrHolder = _originator;
        cpiValue = AggregatorV3Interface(
            // For testnet - 0x43C595165FE9c412EB9a970f446C259eba1a2101
            // For mainnet - 0x9a51192e065ECC6BDEafE5e194ce54702DE4f1f5
            0x43C595165FE9c412EB9a970f446C259eba1a2101
        );
    }

    function originateLoan(
        uint256 loanId,
        string memory ipfsHash,
        uint256 amount,
        uint256 initialInterestRate,
        uint256 margin,
        uint256 lifetimeCap,
        uint256 paymentDate,
        uint256 dueDate,
        uint256 adjustmentInterval
    ) public onlyServicer {
        loans[loanId] = Loan(
            loanId, 
            ipfsHash, 
            amount, 
            initialInterestRate, 
            initialInterestRate, 
            margin,
            lifetimeCap,
            amount, 
            paymentDate,
            dueDate, 
            adjustmentInterval, 
            block.timestamp, 
            false
        );
        emit LoanOriginated(loanId, ipfsHash);
    }

    function calculateMonthlyInterest(uint256 upb, uint256 annualRate) internal pure returns (uint256) {
        return (upb * annualRate) / (12 * 10000);
    }

    function getCPILatestAnswer() public view returns (int) {
        (
            /* uint80 roundID */,
            int answer,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = cpiValue.latestRoundData();
        return answer;
    }

    function adjustInterestRate(uint256 loanId) public onlyServicer {
        Loan storage loan = loans[loanId];
        // Commented out for testing may also allow for override in certain cases but with signature approval from Originator
        // require(block.timestamp >= loan.lastAdjustmentDate + loan.adjustmentInterval, "Adjustment interval not met");

        uint256 newRate = _calculateNewInterestRate(loan.initialInterestRate, loan.margin, loan.lifetimeCap);

        loan.adjustedInterestRate = newRate;
        loan.lastAdjustmentDate = block.timestamp;

        emit InterestRateAdjusted(loanId, newRate);
    }

    function _calculateNewInterestRate(uint256 initialInterestRate, uint256 margin, uint256 lifetimeCap) internal view returns (uint256 newRate) {
        int256 cpiCurrent = getCPILatestAnswer();
        int256 cpiPrior = 127 * 10**16; // Simplified fixed value for testing

        uint256 cpiAdjustment = (uint256(cpiCurrent) - uint256(cpiPrior)) / uint256(cpiPrior);
        newRate = initialInterestRate + margin + cpiAdjustment;

        if (newRate > lifetimeCap) {
            newRate = lifetimeCap;
        }
    }

    function makePayment(uint256 loanId, uint256 amount) public onlyServicer {
        Loan storage loan = loans[loanId];

        (uint256 principalPaid, uint256 interestPaid) = _calculatePayments(loan, amount);

        loan.upb = loan.upb > principalPaid ? loan.upb - principalPaid : 0;

        // Set loan.isPaid to true for the current month
        loan.isPaid = true;
        loan.paymentDate = block.timestamp; // Update the payment date to the current timestamp

        emit PaymentReceived(loanId, amount, 0, principalPaid, interestPaid);
    }

    function _calculatePayments(Loan storage loan, uint256 amount) internal view returns (uint256 principalPaid, uint256 interestPaid) {
        uint256 monthlyInterest = calculateMonthlyInterest(loan.upb, loan.adjustedInterestRate);
        principalPaid = amount > monthlyInterest ? amount - monthlyInterest : 0;
        interestPaid = amount <= monthlyInterest ? amount : monthlyInterest;
    }

    function resetPaymentStatus(uint256 loanId) public onlyServicer {
        Loan storage loan = loans[loanId];

        // Ensure a month has passed since the last payment 
        // Requirement commented out for testing
        // require(block.timestamp >= loan.paymentDate + 30 days, "Payment status can only be reset after a month");

        loan.isPaid = false;

        emit ResetPaymentStatus("Payment status reset for loan", loanId);
    }


    function updateServiceFeeRate(uint256 newRate, bytes memory originatorSignature) public onlyMSRHolder {
        // Verify the originator's signature
        bytes32 messageHash = keccak256(abi.encodePacked(newRate, address(this)));
        require(recoverSigner(messageHash, originatorSignature) == originator, "Invalid originator signature");

        serviceFeeRate = newRate;
        emit ServiceFeeRateUpdated(newRate);
    }

    function setMSRHolder(address newMSRHolder) public onlyMSRHolder {
        msrHolder = newMSRHolder;
        emit MSRHolderChanged(newMSRHolder);
    }

    function recoverSigner(bytes32 messageHash, bytes memory signature) internal pure returns (address) {
        bytes32 ethSignedMessageHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash));
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(signature);
        return ecrecover(ethSignedMessageHash, v, r, s);
    }

    function splitSignature(bytes memory signature) internal pure returns (bytes32 r, bytes32 s, uint8 v) {
        require(signature.length == 65, "Invalid signature length");
        assembly {
            r := mload(add(signature, 0x20))
            s := mload(add(signature, 0x40))
            v := byte(0, mload(add(signature, 0x60)))
        }
    }
    
}
