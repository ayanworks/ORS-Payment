"use strict";

const AcceptETH = artifacts.require("AcceptETH.sol");
const ORSToken = artifacts.require("ORSToken.sol");


const BN = web3.BigNumber;
const { expect } = require("chai").use(require("chai-bignumber")(BN));
const { rejectTx, rejectDeploy } = require("./helpers/common");


contract("AcceptETH", ([owner, holder, trustee, recipient, anyone]) => {

    const deployToken = cap => {
        return ORSToken.new(cap, { from: owner });
    };

    describe("AcceptETH", () => {
     
    })
})