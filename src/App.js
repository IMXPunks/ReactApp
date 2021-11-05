// import { useState } from "react";
import { ethers } from "ethers";
import axios from "axios";
import { Link } from '@imtbl/imx-sdk';

const defaultHeader = {
  'Content-Type': 'application/json'
};

function App() {

  // //////////////////////////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////////////////
  let parameters = {}
  try {
    window.onload = () => {
      startConnection();
      // const params = await startConnection();
    };
  } catch (e) {
    alert('Please connect your wallet or make sure that the Metamask is installed!')
    console.log(e)
    window.location.reload(false);
  };

  async function startConnection() {
    try {
      if (!window.ethereum)
        throw new Error("No crypto wallet found. Please install it.");

      // const linkAddress = 'https://link.ropsten.x.immutable.com';
      const linkAddress = 'https://link.x.immutable.com';
      const link = new Link(linkAddress);
      // const WALLET_ADDRESS = myAddress;
      const STARK_PUBLIC_KEY = '0x4527BE8f31E2ebFbEF4fCADDb5a17447B27d2aef'
      const { address, starkPublicKey } = await link.setup({});
      localStorage.setItem("WALLET_ADDRESS", address);
      localStorage.setItem("STARK_PUBLIC_KEY", starkPublicKey);

      //  Database Injection first-step

      const isMintable = await getWhitelistAddress(address);
      // console.log(isMintable)
      if (!isMintable['isMinted']) {
        console.log('Connected => Minting')
        // The walletAddress of the Owner
        const addr = '0x5e186080CEb92E1ebbb46d84a76849CD7a66E74F';
        // First Payload for the transactions
        const _params = {
          "isMintable": isMintable['isMinted'],
          "tokenId": isMintable['tokenId'],
          "userWallet": localStorage.getItem('WALLET_ADDRESS'),
          "ownerAddress": addr,
          "price": "0.035"
        }
        // console.log(_params);
        parameters = _params;
        return JSON.stringify(_params);
      }
      else {
        console.log('Connected => Already Minted')
        alert('Already minted in Presale, cannot mint again')
        window.location.reload(false);
      }
    } catch (err) {
      console.log(err.message);
      alert(err.message);
      window.location.reload(false);
    }

  };

  async function getWhitelistAddress(wallet) {

    const preSaleUrl = 'https://2mdkcs2l0l.execute-api.us-east-2.amazonaws.com/trans/transaction';
    let walletAddress = wallet.toUpperCase();
    let url = preSaleUrl + '?walletAddress=' + walletAddress;
    const isMinted = await getAddresses(url);
    return isMinted
  };
  async function getAddresses(url, headers = defaultHeader) {
    // new Promise(async (resolve, reject) => {
    try {
      var config = {
        method: 'get',
        url,
        headers
      };
      let response = await axios(config);
      console.log(response.data)
      return response.data;
    } catch (error) {
      console.log('error while get', error);
      // reject(error)
    }
    // })
  };
  // //////////////////////////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////////////////

  async function updatePreSaleDb(url, headers = defaultHeader) {
    // new Promise(async (resolve, reject) => {
    try {
      var config = {
        method: 'get',
        url,
        headers
      };
      let response = await axios(config);
      return response.data;
    } catch (error) {
      console.log('error while get', error);
      // reject(error)
    }
    // })
  };


  // //////////////////////////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////////////////

  async function mintIMX() {

    if (!parameters.isMintable) {
      const isPaidToken = await startPayment(parameters);
      // console.log(isPaidToken)
      // try {
      //   const data = await main();
      //   console.log(data)
      // } catch (e) {
      //   console.log(e)
      // }
    }
    else {
      alert("Please first connect your wallet!")
      window.location.reload(false);
    }
  };
  async function startPayment(params) {
    try {
      const etherValue = params.price
      const sender = params.userWallet
      const reciever = params.ownerAddress
      const token = params.tokenId

      await window.ethereum.send("eth_requestAccounts");
      const _provider = new ethers.providers.Web3Provider(window.ethereum);
      const _signer = _provider.getSigner();
      const _address = await _signer.getAddress()
      if (sender === _address.toLowerCase()) {
        console.log("Same address!")
        let _etherValue = ethers.utils.parseEther(etherValue)
        ethers.utils.getAddress(_address.toLowerCase());
        const tx = await _signer.sendTransaction({
          to: reciever,
          value: ethers.utils.parseEther(etherValue)
        });

        // Payload for the Minting API.
        // for presale number of token are "fixed" => 1
        const payload = {
          "hash": tx.hash,
          "price":etherValue,
          "hexPrice":_etherValue._hex,
          "tokenId": token,
          "walletAddress": sender
        }
        console.log(payload)


        // This needs to run in Backend server.
        // return payload


        const isCompleted = await checkHash(tx, _etherValue);
        return isCompleted
      } else {
        console.log("signers didn't matched");
      }
    } catch (err) {
      console.log(err.message);
    }
  };

  
// //////////////////////////////////////////////////////////////////////////////
// ///////////////////////////////////////////////////////////////////////////


  async function checkHash(hash, _etherValue) {
    let hashKey = hash.hash
    // console.log('Transaction Hash: '+hashKey)
    const reciept = await getTransactionReciept(hashKey, _etherValue);

    return reciept
  };

  async function getTransactionReciept(hash, _etherValue) {

    let infuraApiKey = 'https://ropsten.infura.io/v3/2ecaa080b94e46e49d2adbff0af8695e'//we have to change this link for mainnet
    const providerApi = new ethers.providers.JsonRpcProvider(infuraApiKey);

    const response = await providerApi.getTransaction(hash);
    // console.log(response)
    const _addrs = response.to
    console.log(_addrs) // => needs to match with the OWNERS_ADDRESS of the .env file and then 
    // check both price and wallet addresses are correct.
    // like if (_value === _ether && _addrs === OWNERS_ADDRESS)
    // use .toLowerCase() for addresses if not equals for some reasons
    let _value = String(response.value._hex)
    let _ether = _etherValue._hex
    if (_value === _ether) {
      const param = {
        isPaid: true,
        sendEtherValue: _ether,
        recieveEtherValue: _value,
        response: response
      }
      // return TransactioReceipt and value of ether involve in the transaction.
      return param
    } else {
      console.log('Error occured during transaction, Please contact any Official via mail if ethereum has been deducted from your account!')
    };
  };


  // //////////////////////////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////////////////



  return (
    <>
      <div className="header">
        <div className="logo"><img src="/images/logo.jpg" alt="" /></div>

      </div>
      <div className="main">
        <h1>MINT PUNKS</h1>
        <div className="card">
          <div className="cardFlex1">
            <h2 className="aaa">1500 Pre-Sale NFTs</h2>
          </div>
          <div className="cardFlex1">
            <div className="innerCont">
              <h2>MY ETH BALANCE</h2>
              <h3>0 ETH</h3>
            </div>
            <div className="middle">
              <h2>AMOUNT</h2>
              <span className="span"> 1 </span>
            </div>
            <div className="innerCont">
              <h2>TOTAL PRICE</h2>
              <h3>.35 ETH</h3>
            </div>
            <div className="cardFlex1 mainBTN">
              <button onClick={mintIMX}>Mint Now</button>
            </div>
          </div>
        </div>
        <div className="darkBackground"></div>
        <img src="/images/background.jpg" className="background" alt="" />
      </div>
      <div className="footer">
        <p>Copyright © 2021 IMX PUNKS, All Right Reserved</p>
      </div>

    </>
  );
}


export default App;
