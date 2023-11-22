const AuctionLogic = artifacts.require("AuctionLogic");

contract('AuctionLogic', (accounts) => {
  it('Should work', async() => {
    const auctionLogicInstance = await AuctionLogic.deployed();
    console.log(auctionLogicInstance.address);
    assert(auctionLogicInstance.address !== "");
    let userAddress = accounts[1];
    console.log(`User Address: ${userAddress}`);

    await auctionLogicInstance.auctionProduct("pn", "pd", 100, 100, { from: userAddress });
    userAddress = accounts[2];

    console.log(`User Address: ${userAddress}`);

    const bidAmount = 102;
    await auctionLogicInstance.addBid(accounts[1], 0, { from: accounts[2], value: bidAmount });
    const userListings = await auctionLogicInstance.getAllUserListings();
    console.log(userListings);
  });
});
