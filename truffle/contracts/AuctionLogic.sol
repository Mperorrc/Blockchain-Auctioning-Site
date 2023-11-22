// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract AuctionLogic {
    address public owner;

    struct Listing {
        address productOwner;
        string productName;
        string productDescription;
        uint256 minProductCost;
        uint256 auctionStartTime;
        uint256 auctionEndTime;
        bool auctionLive;
        uint256 highestBid;
        address bestBidder;
        uint256 listingIndex;
    }

    mapping(address => Listing[]) listings;
    address[] allUsers;

    constructor() {
        owner = msg.sender;
    }

    modifier RestirctAuctionOwner() {
        require(msg.sender != owner, "The auction owner must not participate!!!");
        _;
    }

    function auctionProduct(
        string memory _productName,
        string memory _productDescription,
        uint256 _minCost,
        uint256 _auctionLength
    ) public RestirctAuctionOwner() {
        
        require(_minCost >= 0, "Invalid Product Cost");
        require(_minCost <= 10000000000000000000, "Product cost exceeded maximum auction starting price");
        require(_auctionLength > 10, "Auction must be live for at least 10 seconds");
        require(_auctionLength <= 31536000, "Auction can only last for a year");

        Listing memory newListing = Listing({
            productOwner: msg.sender,
            productName: _productName,
            productDescription: _productDescription,
            minProductCost: _minCost,
            auctionStartTime: block.timestamp,
            auctionEndTime: block.timestamp + _auctionLength,
            auctionLive: true,
            highestBid: 0,
            bestBidder: msg.sender,
            listingIndex:listings[msg.sender].length

        });

        if (listings[msg.sender].length == 0) {
            allUsers.push(msg.sender);
        }

        listings[msg.sender].push(newListing);
    }

    function addBid(
        address productOwner, 
        uint256 listingIndex
    ) public payable RestirctAuctionOwner() {

        require(listingIndex>=0 && listings[productOwner].length>listingIndex,"Invalid Listing Index");
        require(msg.value > listings[productOwner][listingIndex].highestBid, "Bid must be higher than the current highest bid");
        require(block.timestamp<listings[productOwner][listingIndex].auctionEndTime, "The Auction for this product has ended");
        require(listings[productOwner][listingIndex].auctionLive, "The Auction for this product has ended");
        require(msg.sender != productOwner,"You cannot bid for a product you have listed");

        // Return funds to the previous highest bidder
        if (listings[productOwner][listingIndex].bestBidder != msg.sender && listings[productOwner][listingIndex].highestBid>0) {
            payable(listings[productOwner][listingIndex].bestBidder).transfer(listings[productOwner][listingIndex].highestBid);
        }

        // Update highest bid and bidder
        listings[productOwner][listingIndex].highestBid = msg.value;
        listings[productOwner][listingIndex].bestBidder = msg.sender;
    }

    function withdrawFunds(
        uint256 listingIndex
    ) public payable RestirctAuctionOwner(){
        
        require(listingIndex>=0 && listings[msg.sender].length>listingIndex,"Invalid Listing Index");
        require(listings[msg.sender][listingIndex].highestBid>0,"No bids Yet!!!");
        require(listings[msg.sender][listingIndex].auctionLive == true,"Funds already withdrawn");
        
        payable(owner).transfer(listings[msg.sender][listingIndex].highestBid);
        listings[msg.sender][listingIndex].auctionLive = false;
    }

    function getUserListings(address user) public view returns (Listing[] memory) {
        return listings[user];
    }

    function getAllUserListings() public view returns (Listing[] memory) {
        uint256 totalListings;
        for (uint256 i = 0; i < allUsers.length; i++) {
            totalListings += listings[allUsers[i]].length;
        }

        Listing[] memory allListings = new Listing[](totalListings);
        uint256 index;

        for (uint256 i = 0; i < allUsers.length; i++) {
            Listing[] storage userListing = listings[allUsers[i]];
            for (uint256 j = 0; j < userListing.length; j++) {
                allListings[index] = userListing[j];
                index++;
            }
        }

        return allListings;
    }
}
