import React,{useEffect,useState} from 'react';
import './App.css';
import Auction from './contracts/AuctionLogic.json';
import BigNumber from 'bignumber.js';
import { parseUnits } from 'ethers/lib/utils';
const ethers = require("ethers");


const contractAddress = '0x412C8E881825a3cfB5b045f666d79fbe91f0DE50';

function App() {
  const [userAccount, setUserAccount] = useState('');
  const [userDisplayState,setUserDisplayState] = useState(true);
  const [listProductName,setListProductName] = useState("");
  const [listAddress,setListAddress] = useState("");
  const [listProductDescription,setListProductDescription] = useState("");
  const [listMinimumStartingPrice,setListMinimumStartingPrice] = useState();
  const [listAuctionLength,setListListAuctionLength] = useState();
  const [showUserListing,setShowUserListing] = useState("");
  const [userlistings,setUserListings] = useState([]);
  const [listings,setListings] = useState([]);
  const [listBidValues,setListBidValues] = useState();
  
  function onListSubmit(){
    console.log("Works");
    if(listProductName.length===0){
      console.log("Invalid Product Name");
      return;
    }
    if(listProductDescription.length===0){
      console.log("Invalid Product Desctiption");
      return;
    }
    listProduct();
    console.log("Works");
  }

  async function initialize() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    return new ethers.Contract(contractAddress, Auction.abi, signer);
  }

  async function requestAccount() {
    try {
      // Request accounts using MetaMask or other Ethereum provider
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
  
      if (accounts.length > 0) {
        const account = accounts[0];
        setUserAccount(account); // Assuming you have a setUserAccount function
      } else {
        console.error('No accounts returned');
      }

    } catch (error) {
      console.error('Error requesting accounts:', error.message);
    }
  }

  async function getListings(){
    if (typeof window.ethereum !== 'undefined') {
      const contract = await initialize();      
      try {
        let userlistings = await contract.getAllUserListings();
        let updatedUserListings = [];

        for (let i = 0; i < userlistings.length; i++) {
          // console.log(userlistings[i].minProductCost._hex)
          const updatedListing = {
            ...userlistings[i],
            minProductCost: new BigNumber(userlistings[i].minProductCost._hex).toNumber(),
            listingIndex: new BigNumber(userlistings[i].listingIndex._hex).toNumber(),
            highestBid: new BigNumber(userlistings[i].highestBid._hex).toNumber(),
            auctionStartTime: new BigNumber(userlistings[i].auctionStartTime._hex).toNumber(),
            auctionEndTime: new BigNumber(userlistings[i].auctionEndTime._hex).toNumber(),
          };
          updatedUserListings.push(updatedListing);
        }
        setListings(updatedUserListings);
        const initialArray = Array.from({ length: updatedUserListings.length }, () => '0');
        setListBidValues(initialArray);
        // console.log(updatedUserListings);
      } catch (e) {
        console.log('error listing product: ', e);
      }
    }
  }
  async function getUserListings(){
    if(showUserListing.length==0){
      console.log("Invalid User");
      return;
    }
    if (typeof window.ethereum !== 'undefined') {
      const contract = await initialize();      
      try {
        let userproducts = await contract.getUserListings(showUserListing);
        let updatedUserListings = [];

        for (let i = 0; i < userproducts.length; i++) {
          // console.log(userlistings[i].minProductCost._hex)
          const updatedListing = {
            ...userproducts[i],
            minProductCost: new BigNumber(userproducts[i].minProductCost._hex).toNumber(),
            listingIndex: new BigNumber(userproducts[i].listingIndex._hex).toNumber(),
            highestBid: new BigNumber(userproducts[i].highestBid._hex).toNumber(),
            auctionStartTime: new BigNumber(userproducts[i].auctionStartTime._hex).toNumber(),
            auctionEndTime: new BigNumber(userproducts[i].auctionEndTime._hex).toNumber(),
          };
          updatedUserListings.push(updatedListing);
        }
        setUserListings(updatedUserListings);
        // console.log(updatedUserListings);
      } catch (e) {
        console.log('error listing product: ', e);
      }
    }
  }

  async function listProduct(){
    if (typeof window.ethereum !== 'undefined') {
      const contract = await initialize();      
      try {
        await contract.auctionProduct(
          listProductName,
          listProductDescription,
          listMinimumStartingPrice,
          listAuctionLength,
          {from : listAddress}
        );
        const userlistings = await contract.getAllUserListings();
        console.log(userlistings);
      } catch (e) {
        console.log('error listing product: ', e);
      }
    }
  }

  async function addBid(index){
    if(index>=listings.length||index<0){
      console.log("Error in listing index");
      return;
    }
    if(listBidValues[0]==='0'){
      console.log("Add a minimum Bid Value");
    }
    if (typeof window.ethereum !== 'undefined') {
      const contract = await initialize();      
      try {
        await contract.addBid(listings[index].productOwner, listings[index].listingIndex, {
          value: parseUnits(listBidValues[index],'wei'),
        });
      } catch (e) {
        console.log('error placing bid: ', e);
      }
    }
  }

  async function withdrawListing(index){
    if(index>=userlistings.length||index<0){
      console.log("Error in listing index");
      return;
    }
    if (typeof window.ethereum !== 'undefined') {
      const contract = await initialize();      
      try {
        console.log(userlistings[index].listingIndex,userlistings.length)
        await contract.withdrawFunds(userlistings[index].listingIndex);
      } catch (e) {
        console.log('error placing bid: ', e);
      }
    }
  }

  const handleListInputChange = (index, event) => {
    const inputValue = event.target.value;
    if (/^\d+$/.test(inputValue) || inputValue === '') {
    const sanitizedValue = inputValue.replace(/^0*(?=[1-9])/, '') || '0';

    const updatedListBidValues = [...listBidValues];
    updatedListBidValues[index] = sanitizedValue;
    setListBidValues(updatedListBidValues);
    }
  };

  function timestampToDateTime(timestamp) {
    const milliseconds = timestamp * 1000;
    const date = new Date(milliseconds);
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    const hours = ('0' + date.getHours()).slice(-2);
    const minutes = ('0' + date.getMinutes()).slice(-2);
    const seconds = ('0' + date.getSeconds()).slice(-2);
    const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  
    return formattedDateTime;
  }

  useEffect(() => {
    requestAccount();
    getListings();
  }, []);


  return (
    <div className="container" >
      <div className="userbox">
        <div className='choice'>
          <div 
            className="options" 
            onClick={()=>setUserDisplayState(true)}
          >
            List
          </div>
          <div 
            className="options" 
            onClick={()=>setUserDisplayState(false)}
          >
            Withdraw
          </div>
        </div>
        {userDisplayState?(
          <div className='content'>
            <div className='enlistBox'>
              <div className='classes'>
                <div className='class'>
                  <div>User Address:</div>
                </div>
                <div className='class'>
                  <div>Product Name:</div>
                </div>
                <div className='class'>
                <div>Product Description:</div>
                </div>
                <div className='class'>
                <div>Minimum Starting Price:</div>
                </div>
                <div className='class'>
                <div>Auction Length (in seconds):</div>
                </div>
              </div>
              <div className='inputs'>
                <div className='input'>
                  <input type="text" id="_address" name="_address" value={listAddress} onChange={(event) => {setListAddress(event.target.value)}} required/>
                </div>
                <div className='input'>
                  <input type="text" id="_productName" name="_productName" value={listProductName} onChange={(event)=>setListProductName(event.target.value)} required/>
                </div>
                <div className='input'>
                  <textarea id="_productDescription" name="_productDescription" rows="4" value={listProductDescription} onChange={(event)=>setListProductDescription(event.target.value)} required></textarea>
                </div>
                <div className='input-last'>
                  <input type="number" id="_listMinimumStartingPrice" name="_listMinimumStartingPrice" value={listMinimumStartingPrice} onChange={(event)=>setListMinimumStartingPrice(event.target.value)} required/>
                </div>
                <div className='input'>
                  <input type="number" id="_listAuctionLength" name="_listAuctionLength" value={listAuctionLength} onChange={(event)=>setListListAuctionLength(event.target.value)} required/>
                </div>
              </div>               
            </div>
            <div className='submitButton'>
              <div className='buttondiv'>
                <button 
                  className='button-71' 
                  role='button' 
                  type='button' 
                  onClick={onListSubmit} 
                  style={{marginLeft:"30%"}}
                >Submit</button>
              </div>
            </div>
          </div>
        ):(
          <div className='userDisplayBox'>
            <div className='withdrawBox'>
              {
                showUserListing.length===0?(
                  <div style={{marginLeft:"2%",marginTop:"10%",height:"100%",width:"100%",alignItems:"center",justifyContent:"center",fontSize:"30px"}}>
                    User {showUserListing} hasn't listed any products yet
                  </div>
                ):(
                  userlistings.map((item, index) => (
                    <div className='withdrawProductObject' key={index}>
                      <div className='withdrawObjectDiv'>Product owner : {item.productOwner}</div>
                      <div className='withdrawObjectDiv'>Product Name : {item.productName}</div>
                      <div className='withdrawObjectDiv'>Product Description : {item.productDescription}</div>
                      <div className='withdrawObjectDiv'>Min Cost of Product : {item.minProductCost}</div>
                      <div className='withdrawObjectDiv'>Auction Start Time : {timestampToDateTime(item.auctionStartTime)}</div> 
                      <div className='withdrawObjectDiv'>Auction End Time : {timestampToDateTime(item.auctionEndTime)}</div>
                      <div className='withdrawObjectDiv'>Auction Status : {item.auctionLive===true?"Live":"Ended"}</div> 
                      <div className='withdrawObjectDiv'>Highest Bid : {item.highestBid} wei</div>
                      <div className='withdrawObjectDiv'>Highest Bidder : {item.bestBidder}</div>
                      <button 
                        className='button-71' 
                        role='button' 
                        type='button' 
                        style={{marginLeft:"40%", marginBottom:"2%"}}
                        onClick={()=>{withdrawListing(index)}}
                      >Withdraw</button>            
                    </div>
                  ))
                )
              }
              
            </div>
            <div className='submitButton'>
                <div className='switchbox'> 
                <input
                  type="text"
                  id="_showUserListing"
                  name="_showUserListing"
                  value={showUserListing}
                  onChange={(event) => setShowUserListing(event.target.value)}
                  style={{width:"250px ",marginLeft:"20%", marginTop:"8%",opacity:"1" ,backgroundColor: "black",border:"2px solid gray",color:"white" }}
                  required
                />
                </div>
                <div className='switchbox'>
                  <button 
                    className='button-71' 
                    role='button' 
                    type='button' 
                    onClick={getUserListings} 
                    style={{ marginTop:"25px"}}
                  >Get listings</button>
                </div>
            </div>
          </div>          
        )}
      </div>
      <div className="bidbox">
          <div className='listingbox'>
          <button 
                className='button-71' 
                role='button' 
                type='button' 
                style={{marginLeft:"38%", marginTop:"5%"}}
                onClick={getListings}
              >get all Listings</button>
          {listings.map((item, index) => (
            <div className='productObject' key={index}>
              <div className='objectDiv'>Product owner : {item.productOwner}</div>
              <div className='objectDiv'>Product Name : {item.productName}</div>
              <div className='objectDiv'>Product Description : {item.productDescription}</div>
              <div className='objectDiv'>Min Cost of Product : {item.minProductCost}</div>
              <div className='objectDiv'>Auction Start Time : {timestampToDateTime(item.auctionStartTime)}</div> 
              <div className='objectDiv'>Auction End Time : {timestampToDateTime(item.auctionEndTime)}</div>
              <div className='objectDiv'>Auction Status : {item.auctionLive===true?"Live":"Ended"}</div> 
              <div className='objectDiv'>Highest Bid : {item.highestBid} wei</div>
              <div className='objectDiv'>Highest Bidder : {item.bestBidder}</div>
              <div className='listingBidBox'>
                <div className='listingBidBoxObjects'>
                  <input
                    type="text"
                    id={index}
                    name="inputBidAmount"
                    value={listBidValues[index]}
                    onChange={(event) =>{handleListInputChange(index, event)}}
                    style={{width:"200px ", marginTop:"8%",opacity:"1" ,backgroundColor: "black",border:"2px solid gray",color:"white" }}
                    required
                    placeholder="Enter Bid Amount"
                  />
                </div>
                <div className='listingBidBoxObjects'>
                  <button 
                    className='button-71' 
                    role='button' 
                    type='button' 
                    style={{marginTop:"4%"}}
                    onClick={()=>{addBid(index)}}
                  >Bid</button>            
                </div>
              </div>
            </div>
          ))}
          </div>
      </div>
    </div>    
  );
}

export default App;