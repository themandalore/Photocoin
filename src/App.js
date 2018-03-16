//start local with npm run start
import React, { Component } from 'react'
import PhotoMarket from '../build/contracts/PhotoMarket.json'
import PhotoCore from '../build/contracts/PhotoCore.json'
import Auction from '../build/contracts/Auction.json'
import getWeb3 from './utils/getWeb3'
//import Lightbox from 'react-images';

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
      auctionbook: []
    }
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
    })
    .catch(() => {
      console.log('Error finding web3.')
    })
  }

  getOwner(){
    let currentComponent = this;
    const contract = require('truffle-contract')
    const photoCore = contract(PhotoCore)
    photoCore.setProvider(this.state.web3.currentProvider)
      photoCore.deployed().then((instance)=>{
          instance.owner.call().then(function(result){
            currentComponent.setState({ owner: result})
                var i = currentComponent.state.owner;
                var j =currentComponent.state.storageValue;
                console.log("test",i,j)
                if(i === j){
                    currentComponent.setState({auctionButton :(<p><button onClick={this.buyClick.bind(this)}>List for Auction</button></p>)});
                }
                else{
                   currentComponent.setState({auctionButton:(<p><button disabled>List for Auction</button></p>)});
                }
          })
      })
    console.log('ab',this.auctionButton);

  }

  getmyTokens(){
    let currentComponent = this;
    const contract = require('truffle-contract')
    const photoCore = contract(PhotoCore)
    var add = currentComponent.state.storageValue;
    var tokens = []
    console.log('add',add)
    this.state.web3.eth.getAccounts((error, accounts) => {
      photoCore.setProvider(this.state.web3.currentProvider)
      photoCore.deployed().then((instance)=>{
          instance.tokensOf(accounts[0]).then(function(result){
            console.log(result);
            for(var i=0;i<result.length;i++){
              tokens.push('-')
              tokens.push(result[i].toNumber())
            }
            currentComponent.setState({ myTokens: tokens})
          })
      })
    })

  }

  getOrderbook(){
    let currentComponent = this;
    const contract = require('truffle-contract')
    const photoCore = contract(PhotoCore)
    photoCore.setProvider(this.state.web3.currentProvider)
      photoCore.deployed().then((instance)=>{
          instance.owner.call().then(function(result){
            currentComponent.setState({ owner: result})
                var i = currentComponent.state.owner;
                var j =currentComponent.state.storageValue;
                console.log("test",i,j)
                if(i === j){
                    currentComponent.setState({auctionButton :(<p><button onClick={this.buyClick.bind(this)}>List for Auction</button></p>)});
                }
                else{
                   currentComponent.setState({auctionButton:(<p><button disabled>List for Auction</button></p>)});
                }
          })
      })
    console.log('ab',this.auctionButton);
  }

  getLeaseBook(){
    let currentComponent = this;
    const contract = require('truffle-contract')
    const photoCore = contract(PhotoCore)
    photoCore.setProvider(this.state.web3.currentProvider)
      photoCore.deployed().then((instance)=>{
          instance.owner.call().then(function(result){
            currentComponent.setState({ owner: result})
                var i = currentComponent.state.owner;
                var j =currentComponent.state.storageValue;
                console.log("test",i,j)
                if(i === j){
                    currentComponent.setState({auctionButton :(<p><button onClick={this.buyClick.bind(this)}>List for Auction</button></p>)});
                }
                else{
                   currentComponent.setState({auctionButton:(<p><button disabled>List for Auction</button></p>)});
                }
          })
      })
    console.log('ab',this.auctionButton);
  }

  getAuctionBook(){
    let currentComponent = this;
    const contract = require('truffle-contract')
    const photoCore = contract(PhotoCore)
    photoCore.setProvider(this.state.web3.currentProvider)
      photoCore.deployed().then((instance)=>{
          instance.owner.call().then(function(result){
            currentComponent.setState({ owner: result})
                var i = currentComponent.state.owner;
                var j =currentComponent.state.storageValue;
                console.log("test",i,j)
                if(i === j){
                    currentComponent.setState({auctionButton :(<p><button onClick={this.buyClick.bind(this)}>List for Auction</button></p>)});
                }
                else{
                   currentComponent.setState({auctionButton:(<p><button disabled>List for Auction</button></p>)});
                }
          })
      })
    console.log('ab',this.auctionButton);
  }


  instantiateContract() {
    // Get accounts.
    this.state.web3.eth.getAccounts((error, accounts) => {
        // Update state with the result.
        this.setState({ storageValue: accounts[0]})
    })
  }

  buyClick() {
    const contract = require('truffle-contract')
    const photoMarket = contract(PhotoMarket)
    photoMarket.setProvider(this.state.web3.currentProvider)
    console.log(this.state.web3.currentProvider)
    var price = this.state.price
    console.log("Buy Sent");
    this.state.web3.eth.getAccounts((error, accounts) => {
      photoMarket.deployed().then((instance) => {
      console.log(instance.address);
      return instance.buyPhoto(this.state.tokenId, {from: accounts[0], value:price*1e18,gas:2000000})
      })
    })

 }

  listClick() {
    const contract = require('truffle-contract')
    const photoMarket = contract(PhotoMarket)
    photoMarket.setProvider(this.state.web3.currentProvider)
    var _tokenId = this.state.tokenId 
    var price = this.state.price
    console.log("List Sent", _tokenId , price);
    this.state.web3.eth.getAccounts((error, accounts) => {
      photoMarket.deployed().then((instance) => {
      console.log(instance.address);
      return instance.listPhoto(this.state.tokenId,price * 1e18,{from: accounts[0]})
      })
    })
  }

  unlistClick() {
    const contract = require('truffle-contract')
    const photoMarket = contract(PhotoMarket)
    photoMarket.setProvider(this.state.web3.currentProvider)
    var _tokenId = this.state.tokenId 
    console.log("Unlist Sent");
    this.state.web3.eth.getAccounts((error, accounts) => {
      photoMarket.deployed().then((instance) => {
      console.log(instance.address);
      return instance.unlistPhoto(_tokenId,{from: accounts[0]})
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
                <p><input type="text" pattern="[0-9]*" onInput={this.handleChange.bind(this)} value={this.state.tokenId } />tokenId</p>
                <p>      <input type="text" pattern="[0-9]*" onInput={this.handleChange2.bind(this)} value={this.state.price} />price</p>
                <p><button onClick={this.listClick.bind(this)}>List</button></p>
                <p><button onClick={this.buyClick.bind(this)}>Buy</button></p>
                <p><button onClick={this.unlistClick.bind(this)}>Unlist</button></p>
                <p><button onClick={this.listClick.bind(this)}>List for Lease</button></p>
                <p><button onClick={this.buyClick.bind(this)}>Lease Token</button></p>
                {this.state.auctionButton}
                <p><button onClick={this.buyClick.bind(this)}>Upload Photo</button></p>
                <div>
                  <p>My Photos: {this.state.myTokens}</p>
                    {/*<Lightbox
                      images={[{ src: 'http://example.com/img1.jpg' }, { src: 'http://example.com/img2.jpg' }]}
                      isOpen={this.state.lightboxIsOpen}
                      onClickPrev={this.gotoPrevious}
                      onClickNext={this.gotoNext}
                      onClose={this.closeLightbox}
                    />*/}
                  <p>For Sale Orderbook: {this.state.orderbook}</p>
                  <p>For Lease Orderbook: {this.state.orderbook}</p>
                  <p>Auction House: {this.state.orderbook}</p>
                </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

}

export default App

