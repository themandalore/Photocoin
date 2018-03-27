//start local with npm run start
import React, { Component } from 'react'
import PhotoMarket from '../build/contracts/PhotoMarket.json'
import PhotoCore from '../build/contracts/PhotoCore.json'
import Auction from '../build/contracts/testAuction.json'
import getWeb3 from './utils/getWeb3'

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'


class App extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.state = {
      storageValue: "",
      web3: null,
      tokenId :0,
      price:0,
      owner:"",
      auctionButton:"",
      myTokens :[],
      orderbook: [],
      leasebook: [],
      auctionbook: [],
      currentBlock: 0,
      auction_address:"",
      market_address:"",
      duration:0,
      photoHash:"",
      name:"",
      ISENnumber:"",
      photoOwner:"",
      photographer:"",
      contract: require('truffle-contract'),
      photoMarket:null,
      photoCore:null,
      auction:null
    }
  }



  instantiateContract() {
    this.state.web3.eth.getAccounts((error, accounts) => {
        this.setState({ storageValue: accounts[0]})
        this.getBlock();
    })
    this.setState({ photoCore: this.state.contract(PhotoCore)})
    this.setState({ photoMarket:this.state.contract(PhotoMarket)})
    this.setState({ auction: this.state.contract(Auction)})
    
  }

  getBlock(){
    let currentComponent = this;
    this.state.web3.eth.getBlock('latest', function (e, res) {
      currentComponent.setState({ currentBlock: res.number})
  })
  }
  componentWillMount() {
    getWeb3
    .then(results => {
      this.setState({
        web3: results.web3
      })
      this.instantiateContract()
      this.getmyTokens()
      this.getOwner()
      this.getAuctionBook()
      this.getOrderbook()
      this.getLeaseBook()
    })
    .catch(() => {
      console.log('Error finding web3.')
    })
  }

  reload(){
       this.getmyTokens();this.getOrderbook();this.getAuctionBook();this.getLeaseBook();this.getBlock();  
  }

  eventWatcherCore(_event){
    this.state.photoCore.setProvider(this.state.web3.currentProvider)
    this.state.photoCore.deployed().then((instance)=>{
    let events =instance.Upload({}, {fromBlock:this.state.currentBlock, toBlock: 'latest'});
    events.watch((err: any, event: any) => {
        if (err) {
            console.log(err)
        }
        else {
          this.reload()
        }
    })
  })
  }
  eventWatcherAuction(_event){
    this.state.auction.setProvider(this.state.web3.currentProvider)
    this.state.auction.deployed().then((instance)=>{
    console.log(_event);
    var at = {
        HighestBidIncreased: instance.HighestBidIncreased({}, {fromBlock:this.state.currentBlock, toBlock: 'latest'}),
        AuctionEnded: instance.AuctionEnded({}, {fromBlock:this.state.currentBlock, toBlock: 'latest'})
    };

    let events = at[_event];
    events.watch((err: any, event: any) => {
        if (err) {
            console.log(err)
        }
        else {
          this.reload()
        }
    })
  })
  }
  eventWatcherMarket(_event){
    this.state.photoMarket.setProvider(this.state.web3.currentProvider)
    this.state.photoMarket.deployed().then((instance)=>{
    console.log(_event);
    var at = {
        OrderPlaced: instance.OrderPlaced({}, {fromBlock:this.state.currentBlock, toBlock: 'latest'}),
        OrderRemoved: instance.OrderRemoved({}, {fromBlock:this.state.currentBlock, toBlock: 'latest'}),
        LeaseOrderPlaced: instance.LeaseOrderPlaced({}, {fromBlock:this.state.currentBlock, toBlock: 'latest'}),
        LeaseOrderRemoved: instance.LeaseOrderRemoved({}, {fromBlock:this.state.currentBlock, toBlock: 'latest'}),
        Sale: instance.Sale({}, {fromBlock:this.state.currentBlock, toBlock: 'latest'}),
        Lease: instance.Lease({}, {fromBlock:this.state.currentBlock, toBlock: 'latest'})
     };

    let events = at[_event];
    events.watch((err: any, event: any) => {
        if (err) {
            console.log(err)
        }
        else {
          this.reload()
        }
    })
  })
  }

  getOwner(){
    let currentComponent = this;
    this.state.photoCore.setProvider(this.state.web3.currentProvider)
      this.state.photoCore.deployed().then((instance)=>{
          instance.owner.call().then(function(result){
            console.log(result)
            currentComponent.setState({ owner: result})
                var i = currentComponent.state.owner;
                var j =currentComponent.state.storageValue;
                if(i === j){
                    currentComponent.setState({auctionButton :(<p><button onClick={currentComponent.setAuction.bind(this)}>List for Auction</button></p>)});
                }
                else{
                   currentComponent.setState({auctionButton:(<p><button disabled>List for Auction</button></p>)});
                }
          })
      })
    this.state.auction.setProvider(this.state.web3.currentProvider)
    this.state.auction.deployed().then((instance)=>{
      currentComponent.setState({ auction_address : instance.contract.address});
    })
    
    this.state.photoMarket.setProvider(this.state.web3.currentProvider)
    this.state.photoMarket.deployed().then((instance)=>{
      currentComponent.setState({ market_address : instance.contract.address});
    })
  }

  getmyTokens(){
    let currentComponent = this;
    var tokens = []
    this.state.web3.eth.getAccounts((error, accounts) => {
      this.state.photoCore.setProvider(this.state.web3.currentProvider)
      this.state.photoCore.deployed().then((instance)=>{
          instance.tokensOf(accounts[0]).then(function(result){
            for(var i=0;i<result.length;i++){
              tokens.push('/ Token ID: ')
              tokens.push(result[i].toNumber())
            }
            currentComponent.setState({ myTokens: tokens})
          })
      })
    })

  }

  getOrderbook(){
    let currentComponent = this;
    var tokens = []
    function getOrder(x){
      currentComponent.state.photoMarket.deployed().then((instance)=>{
      instance.forSale.call(x).then(function(res){
        tokens.push('/ token: ')
        tokens.push(res.c[0])
        tokens.push(' price: ')
        tokens.push(res.s)
      }).then(function(){
         currentComponent.setState({ orderbook: tokens})
      })
    })
    }
    this.state.photoMarket.setProvider(this.state.web3.currentProvider)
      this.state.photoMarket.deployed().then((instance)=>{
          instance.getOrderCount().then(function(result){
            for(var i =1;i < result;i++){
              getOrder(i)
            }

          })
      })
  }

  getLeaseBook(){
    let currentComponent = this;
    var tokens = []
    function getLease(x){
      currentComponent.state.photoMarket.deployed().then((instance)=>{
      instance.forLease.call(x).then(function(res){
        tokens.push('/ token: ')
        tokens.push(res.c[0])
        tokens.push(' price: ')
        tokens.push(res.s)
      }).then(function(){
         currentComponent.setState({ leasebook: tokens})
      })
    })
    }
    this.state.photoMarket.setProvider(this.state.web3.currentProvider)
      this.state.photoMarket.deployed().then((instance)=>{
          instance.getLeaseCount().then(function(result){
            for(var i =1;i < result;i++){
              getLease(i);
            }

          })
      })
  }

  getAuctionBook(){
    let currentComponent = this;
    var tokens = []
    function getAuct(x){
      currentComponent.state.auction.deployed().then((instance)=>{
      instance.auctions.call(x).then(function(res){
        tokens.push('/ token: ')
        tokens.push(res[0].c)
        tokens.push('- current Bid: ')
        tokens.push(res[2].c/10000)
      }).then(function(){
         currentComponent.setState({ auctionbook: tokens})
      })
    })
    }
    this.state.auction.setProvider(this.state.web3.currentProvider)
      this.state.auction.deployed().then((instance)=>{
          instance.getNumberofAuctions().then(function(result){
            for(var i =1;i < result;i++){
              getAuct(i)
            }

          })
      })
  }

  buyClick() {
    this.state.photoMarket.setProvider(this.state.web3.currentProvider)
    var price = this.state.price
    this.state.web3.eth.getAccounts((error, accounts) => {
      this.state.photoMarket.deployed().then((instance) => {
      this.eventWatcherMarket("Sale")
      console.log(this.state.tokenId,price)
      return instance.buyPhoto(this.state.tokenId,{from: accounts[0], value:price*1e18,gas:2000000})
      })
    })

 }

  listClick() {
    this.state.photoMarket.setProvider(this.state.web3.currentProvider)
    var price = this.state.price
    this.state.web3.eth.getAccounts((error, accounts) => {
      this.state.photoMarket.deployed().then((instance) => {
      this.eventWatcherMarket("OrderPlaced")
      return instance.listPhoto(this.state.tokenId,price * 1e18,{from: accounts[0],gas:2000000})
      })
    })
  }

  unlistClick() {
    this.state.photoMarket.setProvider(this.state.web3.currentProvider)
    this.state.web3.eth.getAccounts((error, accounts) => {
      this.state.photoMarket.deployed().then((instance) => {
        this.eventWatcherMarket("OrderRemoved")
      return instance.unlistPhoto(this.state.tokenId ,{from: accounts[0],gas:2000000})
      })
    })
  }
  leaseClick() {
    this.state.photoMarket.setProvider(this.state.web3.currentProvider)
    var price = this.state.price
    this.state.web3.eth.getAccounts((error, accounts) => {
      this.state.photoMarket.deployed().then((instance) => {
      this.eventWatcherMarket("Lease")
      return instance.buyLease(this.state.tokenId,{value:price * 1e18,from: accounts[0],gas:2000000})
      })
    })
  }

  listLeaseClick() {
    this.state.photoMarket.setProvider(this.state.web3.currentProvider)
    var price = this.state.price
    this.state.web3.eth.getAccounts((error, accounts) => {
      this.state.photoMarket.deployed().then((instance) => {
      this.eventWatcherMarket("LeaseOrderPlaced")
      return instance.listLease(this.state.tokenId,price * 1e18,{from: accounts[0],gas:2000000})
      })
    })
  }

  unlistLeaseClick() {
    this.state.photoMarket.setProvider(this.state.web3.currentProvider)
    this.state.web3.eth.getAccounts((error, accounts) => {
      this.state.photoMarket.deployed().then((instance) => {
        this.eventWatcherMarket("LeaseOrderRemoved")
      return instance.unlistLease(this.state.tokenId ,{from: accounts[0],gas:2000000})
      })
    })
  }

  setAuction() {
    this.state.auction.setProvider(this.state.web3.currentProvider)
    this.state.web3.eth.getAccounts((error, accounts) => {
      this.state.auction.deployed().then((instance) => {
      return instance.setAuction(this.state.duration * 86400,this.state.tokenId, {from: accounts[0],gas:2000000})
      })
    })
  }

  uploadClick() {
    //Need to add logic to actually save the picture
    this.state.photoCore.setProvider(this.state.web3.currentProvider)
    this.state.web3.eth.getAccounts((error, accounts) => {
      this.state.photoCore.deployed().then((instance) => {
      this.eventWatcherCore("Upload")
      instance.allowUploads.call().then((result) =>{
        console.log(result);
      })
      console.log(this.state.web3.sha3("Doge.jpeg"),"Doge","Anon",0,"0x0d7EFfEFdB084DfEB1621348c8C70cc4e871Eba4")
      console.log(this.state.web3.sha3(this.state.photoHash),this.state.name,this.state.photographer,this.state.isenNumber,this.state.photoOwner)
      return instance.uploadPhoto(this.state.web3.sha3("Doge.jpeg"),"Doge","Anon",0,"0x0d7EFfEFdB084DfEB1621348c8C70cc4e871Eba4",{from: accounts[0]})
     
      //return instance.uploadPhoto(this.state.web3.sha3(this.state.photoHash),this.state.name,this.state.photographer,this.state.isenNumber,this.state.photoOwner,{from: accounts[0]})
      })
    })
  }
  bidAuction() {
    this.state.auction.setProvider(this.state.web3.currentProvider)
    var price = this.state.price
    this.state.web3.eth.getAccounts((error, accounts) => {
      this.state.auction.deployed().then((instance) => {
        this.eventWatcherAuction("HighestBidIncreased")
      return instance.bid(this.state.tokenId, {value:price * 1e18,from: accounts[0],gas:2000000})
      })
    })
  }

  closeAuction(){
    this.state.auction.setProvider(this.state.web3.currentProvider)
    this.state.web3.eth.getAccounts((error, accounts) => {
      this.state.auction.deployed().then((instance) => {
        this.eventWatcherAuction("AuctionEnded")
      return instance.endAuction(this.state.tokenId,{from: accounts[0],gas:2000000})
      })
    })
  }
  withdrawAuction(){
    this.state.auction.setProvider(this.state.web3.currentProvider)
    this.state.web3.eth.getAccounts((error, accounts) => {
      this.state.auction.deployed().then((instance) => {
      return instance.withdraw({from: accounts[0],gas:2000000})
      })
    })
  }

    handleChange(e) {
        this.setState({[e.target.name]: e.target.value});
    }

  render() {
    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
            <a href="#" className="pure-menu-heading pure-menu-link"></a>
        </nav>

        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1">
              <h1>Photocoin Dapp</h1>
              <p>Powered by Ethereum and the revolution</p>
              <p>Your Metamask address is: {this.state.storageValue}</p>
              <p>The owner of the contract is: {this.state.owner}</p>
              <h2>Market Functionality</h2>
                <p>Token ID:&nbsp;<input type="text" name="tokenId" pattern="[0-9]*" onInput={this.handleChange}/></p>
                <p>Price:&nbsp;<input type="text" name="price" pattern="[0-9]*" onInput={this.handleChange}/></p>
                <p><button onClick={this.listClick.bind(this)}>List</button>&nbsp;
                 <button onClick={this.buyClick.bind(this)}>Buy</button>&nbsp;
                 <button onClick={this.unlistClick.bind(this)}>Unlist</button></p>
                <p><button onClick={this.listLeaseClick.bind(this)}>List for Lease</button>&nbsp;
                 <button onClick={this.unlistLeaseClick.bind(this)}>Unlist Lease</button>&nbsp;
                 <button onClick={this.leaseClick.bind(this)}>Lease Token</button></p>
                 <h2>Auction Functionality</h2>
                {this.state.auctionButton}
                <p>Duration:&nbsp; <input type="text" name="duration" pattern="[0-9]*" onInput={this.handleChange}/>&nbsp;(days)</p>
                <p><button onClick={this.bidAuction.bind(this)}>Bid</button>&nbsp;
                <button onClick={this.withdrawAuction.bind(this)}>Withdraw</button>&nbsp;
                <button onClick={this.closeAuction.bind(this)}>End Auction</button></p>
                <h2>Upload a Photo</h2>
                <p>Photo:&nbsp; <input type="file" name="photoHash" onInput={this.handleChange}/></p>
                <p>Photo Name:&nbsp; <input type="text" name="name" onInput={this.handleChange}/></p>
                <p>Photographer:&nbsp; <input type="text" name="photographer" onInput={this.handleChange}/></p>
                <p>ISEN Number:&nbsp; <input type="text" pattern="[0-9]*" name="isenNumber" onInput={this.handleChange}/></p>
                <p>Owner:&nbsp;<input type="text" name="photoOwner" onInput={this.handleChange}/></p>
                <p><button onClick={this.uploadClick.bind(this)}>Upload Photo</button></p>
                <div>
                  <h2>My Photos:</h2>
                   {this.state.myTokens}
                  <h2>For Sale Orderbook:</h2>
                   {this.state.orderbook}
                  <h2>For Lease Orderbook: </h2>
                  {this.state.leasebook}
                  <h2>Auction House:</h2>
                   {this.state.auctionbook}
                </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

}

export default App
