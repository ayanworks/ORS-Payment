var Migrations = artifacts.require("./ORSToken.sol");
var PaymentInORS = artifacts.require("./PaymentInORS.sol");

module.exports = function(deployer) {
  deployer.deploy(Migrations,"833333333000000000000000000");
  deployer.deploy(PaymentInORS);

};
