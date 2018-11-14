"use strict";

const AcceptORS = artifacts.require("AcceptORS.sol");
const ORSToken = artifacts.require("ORSToken.sol");


const BN = web3.BigNumber;
const { expect } = require("chai").use(require("chai-bignumber")(BN));
const { rejectTx, rejectDeploy } = require("./helpers/common");


contract("AcceptORS", ([owner, holder, trustee, recipient, anyone]) => {

    const deployToken = cap => {
        return ORSToken.new(cap, { from: owner });
    };


    describe("deployment", () => {
        const name = "ORS Token";
        const symbol = "ORS";
        const decimals = 18;
        const cap = 2525;
        let token;

        describe("with invalid parameters", () => {

            it("fails if cap is zero", async () => {
                await rejectDeploy(deployToken(0));
            });
        });

        describe("with valid parameters", () => {
            const cap = 2525;
            let token;

            it("succeeds", async () => {
                token = await ORSToken.new(cap, { from: owner });
                expect(await web3.eth.getCode(token.address)).to.be.not.oneOf(["0x", "0x0"]);
            });

            it("sets correct owner", async () => {
                expect(await token.owner()).to.be.bignumber.equal(owner);
            });

            it("sets correct cap", async () => {
                expect(await token.cap()).to.be.bignumber.equal(cap);
            });

            it("has correct name", async () => {
                expect(await token.name()).to.be.equal("ORS Token");
            });

            it("has correct symbol", async () => {
                expect(await token.symbol()).to.be.equal("ORS");
            });

            it("has correct decimals", async () => {
                expect(await token.decimals()).to.be.bignumber.equal(18);
            });

            it("is initially paused", async () => {
                expect(await token.paused()).to.be.true;
            });
        });
    });

    describe("AcceptORS", () => {
        let token;
        let acceptORS;
        var acceptORSAddress;

        before("deploy and mint and approve", async () => {
            const cap = 2525;
            token = await ORSToken.new(cap, { from: owner });
            acceptORS = await AcceptORS.new({ from: owner });

            acceptORSAddress = acceptORS.address;

            await token.unpause({ from: owner });
            await token.mint(holder, 1000, { from: owner });
            // await token.approve(trustee, 400, { from: holder });
            await token.approve(acceptORS.address, 400, { from: holder });

            await token.pause({ from: owner });
            await token.finishMinting({ from: owner });
        });


        describe('transfer tokens', () => {

            it("permits to transfer from", async () => {

                await token.unpause({ from: owner });

                let holdersBalance = await token.balanceOf(holder);
                let recipientsBalance = await token.balanceOf(recipient);
                let allowance = await token.allowance(holder, acceptORSAddress);
                
                await acceptORS.setORSTokenContractAddress(token.address);
                
                await acceptORS.acceptAndTransfer(holder, recipient, 400);
                expect(await token.balanceOf(holder)).to.be.bignumber.equal(holdersBalance.minus(400));
                expect(await token.balanceOf(recipient)).to.be.bignumber.equal(recipientsBalance.plus(400));
                expect(await token.allowance(holder, acceptORSAddress)).to.be.bignumber.equal(allowance.minus(400));

            });

            describe('transfer initiated other than owner', () => {
                it("forbids to transfer", async () => {
                    await rejectTx(acceptORS.acceptAndTransfer(holder, recipient, 400, { from: anyone }))
                });
            });

            describe('transfer tokens without balance', () => {
                it("forbids to transfer", async () => {
                    await token.approve(holder, 400, { from: trustee });
                    await rejectTx(acceptORS.acceptAndTransfer(trustee, recipient, 400, { from: owner }))
                });
            });

            describe('transfer tokens without allowance', () => {
                it("forbids to transfer", async () => {
                    await rejectTx(acceptORS.acceptAndTransfer(holder, recipient, 400, { from: owner }))
                });
            });

            describe('transfer token greater than allowed', () => {
                it("forbids to transfer", async () => {
                    await rejectTx(acceptORS.acceptAndTransfer(holder, recipient, 800, { from: owner}));
                });
            });
        });

    })

});