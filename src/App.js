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
    super(props)
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
      contract: require('truffle-contract')
    }
  }



  instantiateContract() {
    this.state.web3.eth.getAccounts((error, accounts) => {
        this.setState({ storageValue: accounts[0]})
        this.getBlock();
    })
    
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

  eventWatcher(){
    const photoMarket= this.state.contract(PhotoMarket)
    photoMarket.setProvider(this.state.web3.currentProvider)
    photoMarket.deployed().then((instance)=>{
    let events = instance.OrderPlaced({}, {fromBlock:this.state.currentBlock, toBlock: 'latest'})
    events.watch((err: any, event: any) => {
        if (err) {
            console.log(err)
        }
        else {
          this.getmyTokens();
          this.getOrderbook();
          this.getAuctionBook();
          this.getLeaseBook();
          this.getBlock();
          
        }
    })
  })
  }

  getOwner(){
    let currentComponent = this;
    const photoCore= this.state.contract(PhotoCore)
    photoCore.setProvider(this.state.web3.currentProvider)
      photoCore.deployed().then((instance)=>{
          instance.owner.call().then(function(result){
            currentComponent.setState({ owner: result})
                var i = currentComponent.state.owner;
                var j =currentComponent.state.storageValue;
                if(i === j){
                    currentComponent.setState({auctionButton :(<p><button onClick={this.setAuction.bind(this)}>List for Auction</button></p>)});
                }
                else{
                   currentComponent.setState({auctionButton:(<p><button disabled>List for Auction</button></p>)});
                }
          })
      })
    const auction = this.state.contract(Auction)
    auction.setProvider(this.state.web3.currentProvider)
    auction.deployed().then((instance)=>{
      currentComponent.setState({ auction_address : instance.contract.address});
    })
    
    const market = this.state.contract(PhotoMarket)
    market.setProvider(this.state.web3.currentProvider)
    market.deployed().then((instance)=>{
      currentComponent.setState({ market_address : instance.contract.address});
    })
  }

  getmyTokens(){
    let currentComponent = this;
    const photoCore = this.state.contract(PhotoCore)
    var tokens = []
    this.state.web3.eth.getAccounts((error, accounts) => {
      photoCore.setProvider(this.state.web3.currentProvider)
      photoCore.deployed().then((instance)=>{
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
    const photoMarket = this.state.contract(PhotoMarket)
    var tokens = []
    function getOrder(x){
      photoMarket.deployed().then((instance)=>{
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
    photoMarket.setProvider(this.state.web3.currentProvider)
      photoMarket.deployed().then((instance)=>{
          instance.getOrderCount().then(function(result){
            for(var i =1;i < result;i++){
              getOrder(i)
            }

          })
      })
  }

  getLeaseBook(){
    let currentComponent = this;
    const photoMarket = this.state.contract(PhotoMarket)
    var tokens = []
    function getLease(x){
      photoMarket.deployed().then((instance)=>{
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


    photoMarket.setProvider(this.state.web3.currentProvider)
      photoMarket.deployed().then((instance)=>{
          instance.getLeaseCount().then(function(result){
            for(var i =1;i < result;i++){
              getLease(i);
            }

          })
      })
  }

  getAuctionBook(){
    let currentComponent = this;
    const auction = this.state.contract(Auction)
    var tokens = []
    function getAuct(x){
      auction.deployed().then((instance)=>{
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

    auction.setProvider(this.state.web3.currentProvider)
      auction.deployed().then((instance)=>{
          instance.getNumberofAuctions().then(function(result){
            for(var i =1;i < result;i++){
              getAuct(i)
            }

          })
      })
  }

  buyClick() {
    const photoMarket = this.state.contract(PhotoMarket)
    photoMarket.setProvider(this.state.web3.currentProvider)
    var price = this.state.price
    this.state.web3.eth.getAccounts((error, accounts) => {
      photoMarket.deployed().then((instance) => {
      this.eventWatcher()
      return instance.buyPhoto(this.state.tokenId, {from: accounts[0], value:price*1e18,gas:2000000})
      })
    })

 }

  listClick() {
    const photoMarket = this.state.contract(PhotoMarket)
    photoMarket.setProvider(this.state.web3.currentProvider)
    var price = this.state.price
    this.state.web3.eth.getAccounts((error, accounts) => {
      photoMarket.deployed().then((instance) => {
        console.log(instance);
      this.eventWatcher()
      return instance.listPhoto(this.state.tokenId,price * 1e18,{from: accounts[0],gas:2000000})
      })
    })
  }

  unlistClick() {
    const photoMarket = this.state.contract(PhotoMarket)
    photoMarket.setProvider(this.state.web3.currentProvider)
    this.state.web3.eth.getAccounts((error, accounts) => {
      photoMarket.deployed().then((instance) => {
        this.eventWatcher()
      return instance.unlistPhoto(this.state.tokenId ,{from: accounts[0],gas:2000000})
      })
    })
  }
  leaseClick() {
    const photoMarket = this.state.contract(PhotoMarket)
    photoMarket.setProvider(this.state.web3.currentProvider)
    var price = this.state.price
    this.state.web3.eth.getAccounts((error, accounts) => {
      photoMarket.deployed().then((instance) => {
      this.eventWatcher()
      return instance.buyLease(this.state.tokenId,{value:price * 1e18,from: accounts[0],gas:2000000})
      })
    })
  }

  listLeaseClick() {
    const photoMarket = this.state.contract(PhotoMarket)
    photoMarket.setProvider(this.state.web3.currentProvider)
    var price = this.state.price
    this.state.web3.eth.getAccounts((error, accounts) => {
      photoMarket.deployed().then((instance) => {
      this.eventWatcher()
      return instance.listLease(this.state.tokenId,price * 1e18,{from: accounts[0],gas:2000000})
      })
    })
  }

  unlistLeaseClick() {
    const photoMarket = this.state.contract(PhotoMarket)
    photoMarket.setProvider(this.state.web3.currentProvider)
    this.state.web3.eth.getAccounts((error, accounts) => {
      photoMarket.deployed().then((instance) => {
        this.eventWatcher()
      return instance.unlistLease(this.state.tokenId ,{from: accounts[0],gas:2000000})
      })
    })
  }

  setAuction() {
    const auction = this.state.contract(Auction)
    auction.setProvider(this.state.web3.currentProvider)
    this.state.web3.eth.getAccounts((error, accounts) => {
      auction.deployed().then((instance) => {
        this.eventWatcher()
      return instance.setAuction(this.state.duration * 86400,this.state.tokenId, {from: accounts[0],gas:2000000})
      })
    })
  }

  uploadClick() {
    const photoMarket = this.state.contract(PhotoMarket)
    photoMarket.setProvider(this.state.web3.currentProvider)
    this.state.web3.eth.getAccounts((error, accounts) => {
      photoMarket.deployed().then((instance) => {
      this.eventWatcher()
      return instance.buyLease(this.state.photoHash,this.state.name,this.state.photographer,this.state.isenNumber,this.state.photoOwner,{from: accounts[0]})
      })
    })
  }
  bidAuction() {
    const auction = this.state.contract(Auction)
    auction.setProvider(this.state.web3.currentProvider)
    var price = this.state.price
    this.state.web3.eth.getAccounts((error, accounts) => {
      auction.deployed().then((instance) => {
        this.eventWatcher()
      return instance.bid(this.state.tokenId, {value:price * 1e18,from: accounts[0],gas:2000000})
      })
    })
  }
  closeAuction(){
    const auction = this.state.contract(Auction)
    auction.setProvider(this.state.web3.currentProvider)
    this.state.web3.eth.getAccounts((error, accounts) => {
      auction.deployed().then((instance) => {
        this.eventWatcher()
      return instance.endAuction(this.state.tokenId,{from: accounts[0],gas:2000000})
      })
    })
  }
  withdrawAuction(){
    const auction = this.state.contract(Auction)
    auction.setProvider(this.state.web3.currentProvider)
    this.state.web3.eth.getAccounts((error, accounts) => {
      auction.deployed().then((instance) => {
      return instance.withdraw({from: accounts[0],gas:2000000})
      })
    })
  }

  handleChange(evt) {
      const tokenId  = (evt.target.validity.valid) ? evt.target.value : this.state.tokenId ;
      this.setState({ tokenId });
  }

    handleChange2(evt) {
        const price = (evt.target.validity.valid) ? evt.target.value : this.state.price ;
        this.setState({ price });
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
              <h2>Basic Functions</h2>
              <p>Your Metamask address is: {this.state.storageValue}</p>
              <p>The owner of the contract is: {this.state.owner}</p>
                <p>Token ID:&nbsp;<input type="text" pattern="[0-9]*" onInput={this.handleChange.bind(this)} value={this.state.tokenId } /></p>
                <p>Price:&nbsp;<input type="text" pattern="[0-9]*" onInput={this.handleChange2.bind(this)} value={this.state.price} /></p>
                <p><button onClick={this.listClick.bind(this)}>List</button></p>
                <p><button onClick={this.buyClick.bind(this)}>Buy</button></p>
                <p><button onClick={this.unlistClick.bind(this)}>Unlist</button></p>
                <p><button onClick={this.listLeaseClick.bind(this)}>List for Lease</button></p>
                <p><button onClick={this.unlistLeaseClick.bind(this)}>Unlist Lease</button></p>
                <p><button onClick={this.leaseClick.bind(this)}>Lease Token</button></p>
                {this.state.auctionButton}
                <p>Duration:&nbsp; <input type="text" pattern="[0-9]*" onInput={this.handleChange.bind(this)} value={this.state.duration} />&nbsp;(days)</p>
                <p><button onClick={this.bidAuction.bind(this)}>Bid</button></p>
                <p><button onClick={this.withdrawAuction.bind(this)}>Withdraw</button></p>
                <p><button onClick={this.closeAuction.bind(this)}>End Auction</button></p>
                <p>Photo Hash:&nbsp;<input type="text" onInput={this.handleChange.bind(this)} value={this.state.photoHash} /></p>
                <p>Photo Name:&nbsp;<input type="text" onInput={this.handleChange.bind(this)} value={this.state.name} /></p>
                <p>Photographer:&nbsp;<input type="text" onInput={this.handleChange.bind(this)} value={this.state.photographer} /></p>
                <p>ISEN Number:&nbsp;<input type="text" onInput={this.handleChange.bind(this)} value={this.state.isenNumber} /></p>
                <p>Owner:&nbsp;<input type="text" onInput={this.handleChange.bind(this)} value={this.state.photoOwner} /></p>
                <p><button onClick={this.uploadClick.bind(this)}>Upload Photo</button></p>
                <div>
                  <p>My Photos:</p>
                   {this.state.myTokens}
                  <p>For Sale Orderbook: {this.state.orderbook}</p>
                  <p>For Lease Orderbook: {this.state.leasebook}</p>
                  <p>Auction House: {this.state.auctionbook}</p>
                </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

}

export default App
