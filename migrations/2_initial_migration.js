var Migrations = artifacts.require("./ORSToken.sol");
var PaymentInORS = artifacts.require("./PaymentInORS.sol");

module.exports = function(deployer) {
  deployer.deploy(Migrations,"2500");
  deployer.deploy(PaymentInORS);

};
