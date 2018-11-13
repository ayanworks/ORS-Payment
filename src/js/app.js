
App = {
  web3Provider: null,
  contracts: {},

  init: function () {
    return App.initWeb3();
  },

  initWeb3: function () {
    // Initialize web3 and set the provider to the testRPC.
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // set the provider you want from Web3.providers
      App.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:9545');
      web3 = new Web3(App.web3Provider);
    }

    return App.initContract();
  },

  initContract: function () {

    $.getJSON('ORSToken.json', function (data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract.
      var ORSTokenArtifact = data;
      // console.log("ORSToken", JSON.stringify(data.abi));
      App.contracts.ORSToken = TruffleContract(ORSTokenArtifact);

      // Set the provider for our contract.
      App.contracts.ORSToken.setProvider(App.web3Provider);
      // App.getMint();
      // Use our contract to retieve and mark the adopted pets.
      // return App.getBalances();
      App.handleGetTokenStatus();
      return App.getTotalSupply();
    });

    $.getJSON('PaymentInORS.json', function (data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract.
      var PaymentInORSArtifact = data;
      App.contracts.PaymentInORS = TruffleContract(PaymentInORSArtifact);

      // Set the provider for our contract.
      App.contracts.PaymentInORS.setProvider(App.web3Provider);

      App.contracts.PaymentInORS.deployed().then(function (instance) {
        paymentInORSInstance = instance;
        console.log(paymentInORSInstance.address);
        $('#TTApproveAddress').val(paymentInORSInstance.address);

      }).catch(function (err) {
        console.log(err.message);
      });

    });
    return App.bindEvents();
  },

  bindEvents: function () {
    $(document).on('click', '#approveTransferButton', App.handleApproveTransfer);

    $(document).on('click', '#transferButton', App.handleTransfer);

    $(document).on('click', '#approveButton', App.handleApprove);

    $(document).on('click', '#setContractAddressButton', App.handleContractAddress);

    $(document).on('click', '#mintTokensButton', App.handleMintTokens);

    $(document).on('click', '#totalSupplyButton', App.getTotalSupply);

    $(document).on('click', '#unpauseButton', App.handleUnpause);

    $(document).on('click', '#pauseButton', App.handlePause);

    $(document).on('click', '#finishMintingButton', App.handleFinishMinting);

    $(document).on('click', '#balanceButton', App.getBalances);

  },

  handleRadioChange: function () {
    
  },


  handlePause: function () {
    console.log('Pause...');

    var orsTokenInstance;

    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.ORSToken.deployed().then(function (instance) {
        orsTokenInstance = instance;

        return orsTokenInstance.pause({ from: account });
      }).then(function (result) {
        console.log("Pause", result.receipt);
        App.handleGetTokenStatus();
      }).catch(function (err) {
        console.log(err.message);
      });
    });
  },

  handleUnpause: function () {
    console.log('unpause...');

    var orsTokenInstance;

    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.ORSToken.deployed().then(function (instance) {
        orsTokenInstance = instance;

        return orsTokenInstance.unpause({ from: account });
      }).then(function (result) {
        console.log("unpause", result.receipt);
        App.handleGetTokenStatus();
      }).catch(function (err) {
        console.log(err.message);
      });
    });
  },

  handleFinishMinting: function () {
    console.log('finishMinting...');

    var orsTokenInstance;

    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.ORSToken.deployed().then(function (instance) {
        orsTokenInstance = instance;

        return orsTokenInstance.finishMinting({ from: account });
      }).then(function (result) {
        console.log("finishMinting", result);
      }).catch(function (err) {
        console.log(err.message);
      });
    });
  },

  handleApprove: function (event) {
    event.preventDefault();

    var amount = parseInt($('#TTApproveAmount').val());
    var toAddress = $('#TTApproveAddress').val();

    var orsTokenInstance;
    var paymentInstance;

    var spender = '';
    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      App.contracts.PaymentInORS.deployed().then(async function (instance) {
        paymentInstance = instance;
        spender = paymentInstance.address;

        App.contracts.ORSToken.deployed().then(async function (instance) {
          orsTokenInstance = instance;

          return await orsTokenInstance.approve(spender, amount);

        }).then(async function (result) {
          console.log("approve result", result)
          await orsTokenInstance.Approval()
            .watch((err, res) =>
              console.info("Approval event", res)
            )
        })
      }).catch(function (err) {
        console.log(err.message);
      });
    });
  },

  handleTransfer: function (event) {
    event.preventDefault();

    var amount = parseInt($('#TTTransferFTAmount').val());
    var fromAddress = $('#TTTransferFromAddress').val();
    var toAddress = $('#TTTransferToAddress').val();

    var orsTokenInstance;
    var paymentInstance;

    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      App.contracts.PaymentInORS.deployed().then(async function (instance) {
        paymentInstance = instance;

        App.contracts.ORSToken.deployed().then(async function (instance) {
          orsTokenInstance = instance;

          return await paymentInstance._transferFrom(fromAddress, toAddress, amount);

        }).then(async function (result) {
          console.log("transfer result", result)

          await orsTokenInstance.Transfer()
            .watch((err, res) =>
              console.info("Transfer event", res)
            )
        })

      }).catch(function (err) {
        console.log(err.message);
      });
    });
  },

  handleApproveTransfer: function (event) {
    event.preventDefault();

    var amount = parseInt($('#TTTransferAmount').val());
    var toAddress = $('#TTTransferAddress').val();

    console.log('Transfer ' + amount + ' TT to ' + toAddress);

    var orsTokenInstance;
    var paymentInstance;

    var spender = '';
    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];
      console.log("account", account);
      console.log("toAddress", toAddress);


      App.contracts.PaymentInORS.deployed().then(async function (instance) {
        paymentInstance = instance;
        spender = paymentInstance.address;
        // console.log(paymentInstance);
        App.contracts.ORSToken.deployed().then(async function (instance) {
          orsTokenInstance = instance;

          return await orsTokenInstance.approve(spender, amount);

        }).then(async function (result) {
          await orsTokenInstance.Approval()
            .watch((err, res) =>
              console.info("Approval event", res)
            )
          // return await orsTokenInstance.transfer(toAddress, amount);

          return await paymentInstance._transferFrom(account, toAddress, amount);
        }).then(async function (result) {
          await orsTokenInstance.Transfer()
            .watch((err, res) =>
              console.info("Transfer event", res)
            )
        })

      }).catch(function (err) {
        console.log(err.message);
      });
    });
  },

  getBalances: function () {
    console.log('Getting balances...');
    var bAddress = $('#TTBalanceAddress').val();

    var orsTokenInstance;

    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.ORSToken.deployed().then(function (instance) {
        orsTokenInstance = instance;

        return orsTokenInstance.balanceOf(bAddress);
      }).then(function (result) {
        balance = result.c[0];

        $('#TTBalance').text(balance);
      }).catch(function (err) {
        console.log(err.message);
      });
    });
  },

  getTotalSupply: function () {
    console.log('Getting total supply...');

    var orsTokenInstance;

    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.ORSToken.deployed().then(function (instance) {
        orsTokenInstance = instance;

        return orsTokenInstance.totalSupply();
      }).then(function (result) {
        balance = result.c[0];

        $('#TTSupply').text(balance);
      }).catch(function (err) {
        console.log(err.message);
      });
    });
  },

  handleMintTokens: function () {
    console.log('Mint...');

    var orsTokenInstance;

    var amount = parseInt($('#TTMintAmount').val());
    var toAddress = $('#TTMintAddress').val();

    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.ORSToken.deployed().then(function (instance) {
        orsTokenInstance = instance;

        return orsTokenInstance.mint(toAddress, amount, { from: account });
      }).then(function (result) {
        console.log("mint: ", result);
        App.getTotalSupply();
      }).catch(function (err) {
        console.log(err.message);
      });
    });
  },

  handleGetTokenStatus: function () {
    console.log('Get Token status...');

    var orsTokenInstance;

    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      App.contracts.ORSToken.deployed().then(function (instance) {
        orsTokenInstance = instance;

        return orsTokenInstance.paused();
      }).then(function (result) {
        console.log("pause: ", result);
        $("#contractStatus").text(result == true ? "paused" : "unpaused");
        return orsTokenInstance.mintingFinished();
      }).then(function (result) {
        console.log("mintingFinished: ", result);
        $("#contractMintStatus").text(result == true ? "off" : "on")
      }).catch(function (err) {
        console.log(err.message);
      });
    });
  },

  handleContractAddress: function (event) {
    event.preventDefault();

    var smAddress = $('#TTSmartContractAddress').val();
    var paymentInORSInstance;

    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.PaymentInORS.deployed().then(function (instance) {
        paymentInORSInstance = instance;
        return paymentInORSInstance.setORSTokenContractAddress(smAddress, { from: account, gas: 100000 });
      }).then(function (result) {
        alert('Address added Successful!');
        return App.getBalances();
      }).catch(function (err) {
        console.log(err.message);
      });
    });
  }

};


$(function () {
  $(window).load(function () {
    App.init();
  });
});
