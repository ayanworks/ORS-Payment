# ORS-Payment
ORS Payment Contract

# Pre-requisites
1) truffle: npm i truffle
2) ganache-cli: npm install -g ganache-cli
3) Metamask.

# Steps to run the Application.
1) Clone or Download application.
2) npm install
3) (in separate terminal) run ganache-cli
4) Make sure Metamask is logged in
5) (in separate terminal) 
	a) truffle compile
	b) truffle migrate
	c) copy the address on which ORSToken contract is deployed.
6) npm run dev

#note: ORSTOken and PaymentInORS Contract owner's address(ORS Group) is accounts[0], Customer address is accounts[1] from ganache-cli accounts.

# Initially create some tokens for a Customer. (For Demo will not required in actual flow)
1) Paste copied ORSToken contract address in "Set ORSToken Contract Address" field and set the address using Contract owners address in Metamask. 
2) If ORSTokens Contract is paused, unpause it using Contract owners address.
3) Mint some tokens to Customer's address using Contract owner's address(accounts[0]).
4) Click "Finish Minting". This will en able approve() and transerFrom() function.

# Steps for approve() and transferFrom()
	Customer will proceed with the desired package to buy. This will give the package price allowance to PaymentInORS Contract to transfer on behalf of him to ORS Group Address. So, in Approve section PaymentInORS contract gets approval to send tokens on behalf of the customer as below.

#approve()
1) Select Customer's Address in Metamask, which will be used for approval.
2) Add number of tokens to 'amount' field of Customer and click Approve.

#transferFrom()
1) Select Contract owners(accounts[0]) address in Metamask.
2) In PaymentInORS Contract add the From address(Customer's address), To Address(ORS Group address) and Amount (No. of Tokens allowed) to transfer and click Transfer.
3) Check the balance in Get Balance section below to check the transfers by providing the address.
