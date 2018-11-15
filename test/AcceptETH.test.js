"use strict";

const AcceptETH = artifacts.require("AcceptETH.sol");
const ORSToken = artifacts.require("ORSToken.sol");

// const web3 = require('web3');
const BN = web3.BigNumber;
const { expect } = require("chai").use(require("chai-bignumber")(BN));
const { rejectTx, rejectDeploy } = require("./helpers/common");


contract("AcceptETH", ([owner, holder, trustee, recipient, anyone]) => {

    describe("Accept Ethers as payment", () => {

        let acceptETHContract;

        before('setup contract for each test', async function () {
            acceptETHContract = await AcceptETH.new({ from: owner })
        })

        describe("transfer ETH", () => {
            it('Ether transferred successfully', async function () {
                var ownerBalance = await web3.eth.getBalance(owner); // because you get a BigNumber
                await acceptETHContract.acceptEther({ from: anyone, value: 1000000000000000000 });
                expect(await web3.eth.getBalance(owner)).to.be.bignumber.equal(ownerBalance.plus(new BN(1000000000000000000)));
            })

        })

        describe("transfer ETH without sufficient balance", () => {

            it('forbids transfer', async function () {
                var holderBalance = await web3.eth.getBalance(holder).toString(10); // because you get a BigNumber
                await rejectTx(acceptETHContract.acceptEther({ from: holder, value: holderBalance }));
            })
        });
    })
})