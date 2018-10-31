"use strict";

// Common helper functions for testing smart contracts via truffle
// G. Baecker, Tecneos UG, 2018
module.exports = (() => {
    const now = () => Math.trunc(Date.now() / 1000);
    //const now = () => web3.eth.getBlock(web3.eth.blockNumber).timestamp;
    const sleep = s => new Promise(resolve => setTimeout(resolve, 1000 * s));

    // Some simple functions to translate durations to seconds.
    const duration = (() => {
        const secs  = n => n;
        const mins  = n => n * secs(60);
        const hours = n => n * mins(60);
        const days  = n => n * hours(24);
        const weeks = n => n * days(7);
        const years = n => n * days(365);

        return {secs, seconds: secs, mins, minutes: mins, hours, days, weeks, years};
    })();

    // Some simple functions to translate currencies to wei.
    const currency = (() => {
        const $ = (n, m) => (new web3.BigNumber(n)).mul(m).trunc();

        const wei      = n => $(n,  1e0);
        const ada      = n => $(n,  1e3);
        const babbage  = n => $(n,  1e6);
        const gwei     = n => $(n,  1e9);
        const szabo    = n => $(n, 1e12);
        const finney   = n => $(n, 1e15);
        const ether    = n => $(n, 1e18);
        const einstein = n => $(n, 1e21);

        return {wei, ada, babbage, gwei, szabo, finney, mether: finney, ether, einstein};
    })();

    // Logging colors.
    const COLOR_CYAN = "\u001b[36m";
    const COLOR_GRAY = "\u001b[90m";
    const COLOR_RESET = "\u001b[0m";

    const log = message => {
        console.log(" ".repeat(8)
                    + COLOR_CYAN + "→ "
                    + COLOR_GRAY + message
                    + COLOR_RESET);
    };

    // Try to execute a transaction and log its gas usage to console.
    // Parameter description is optional.
    // Note: if actual gas usage equals sent gas amount it is very likely that
    //       the transaction has failed, i.e. didn't consume any gas at all.
    const logGas = async (promise, description) => {
        let message = "gas usage";

        if (description) {
            message += " for " + description;
        }

        try {
            let tx = await promise;

            log(message + (tx.hasOwnProperty("receipt")
                           ? ": " + tx.receipt.gasUsed
                           : " unknown due to missing receipt"));

            return tx;
        }
        catch (error) {
            log(message + " unknown due to transaction error");

            throw error;
        }
        // Unreachable
    };

    // Execute a single transaction (promise) and throw if
    // it succeeds or any not-transaction-related error occurs.
    const rejectTx = async promise => {
        let reason = "unknown"; // Why do we think that the transaction succeeded.

        try {
            let tx = await promise;

            if (tx.hasOwnProperty("receipt")) {
                let receipt = tx.receipt;

                // Unfortunately, all cases where seen in the wild.
                if (receipt.status === 0
                 || receipt.status === "0x"
                 || receipt.status === "0x0") {
                    return; // post-Byzantium rejection
                }

                // Weird: Parity doesn't throw and doesn't deliver status.
                if (tx.receipt.status === null) {
                    tx = await web3.eth.getTransaction(receipt.transactionHash);

                    // Heuristic: compare gas provided with gas used.
                    if (tx.gas === receipt.gasUsed) {
                        return; // most likely a rejection
                    }

                    reason = "gasUsed < gasSent";
                }
                else {
                    reason = "status = " + receipt.status;
                }
            }
            else {
                // A missing receipt may indicate a rejection,
                // but we treat it as success to throw the error.
                reason = "no receipt";
            }
        }
        catch (error) {
            let message = error.toString().toLowerCase();

            // That's ugly, older pre-Byzantium TestRPC just throws.
            // Nevertheless, post-Byzantium Ganache throws, too.
            if (message.includes("invalid opcode")
             || message.includes("invalid jump")
             || message.includes("vm exception while processing transaction: revert")) {
                return; // pre-Byzantium rejection
            }

            throw error;
        }

        throw new Error("Transaction should have failed but didn't (" + reason + ").");
    };

    // Deploy a contract and throw if it succeeds or any other
    // not-deployment-related error occurs.
    // Note: ensure deployer has enough funds and sends enough gas.
    const rejectDeploy = async promise => {
        try {
            await promise;
        }
        catch (error) {
            let message = error.toString().toLowerCase();

            if (message.includes("the contract code couldn't be stored")
             || message.includes("vm exception while processing transaction: revert")) {
                return;
            }

            throw error;
        }

        throw new Error("Contract creation should have failed but didn't.");
    };

    const increaseTime = secs =>
        new Promise((resolve, reject) => {
                web3.currentProvider.sendAsync(
                    {jsonrpc: "2.0", method: "evm_increaseTime", params: [secs], id: now()},
                    error => {
                        if (error) { reject(error); }
                        else {
                            web3.currentProvider.sendAsync(
                                {jsonrpc: "2.0", method: "evm_mine", id: now() + 1},
                                (error, result) => {
                                    if (error) { reject(error); }
                                    else { resolve(result); }
                                });
                        }
                    });
            });

    // Create a random address.
    const randomAddr = () => {
        let digits = [];

        for (let i = 0; i < 40; ++i) {
            digits.push(Math.trunc(16 * Math.random()).toString(16));
        }

        return "0x" + digits.join("");
    };

    return {
        now,
        sleep,
        duration,
        currency,
        log,
        logGas,
        rejectTx,
        rejectDeploy,
        increaseTime,
        randomAddr,
    };
})();

