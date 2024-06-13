import React, { useState, useEffect } from 'react';

/**
 * Truncate the wallet address for display purposes.
 * @param {string} wallet - The wallet address to truncate.
 * @returns {string} - The truncated wallet address or an error message.
 */
function truncateWalletAddress(wallet) {
  if (!wallet || typeof wallet !== 'string') {
    return 'Invalid wallet address';
  }
  return `${wallet.substring(0, 7)}...${wallet.substring(wallet.length - 6)}`;
}

const ConnectWalletButton = ({ token }) => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [hasBalance, setHasBalance] = useState(null);
  const [usdtBalance, setUSDTBalance] = useState(null);
  const [isValidUser, setIsValidUser] = useState(null);
  const [error, setError] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(null);
  const [username, setUsername] = useState(null);
  const [profilePic, setProfilePic] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    document.title = 'CryoDAO - Verify Wallet';
    
    // Make a POST request to the /check_verify endpoint
    fetch('http://localhost:3001/check_verify', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    })
      .then(async (response) => {
        if (response.status === 200) {
          const data = await response.json();
          setIsValidUser(true);
          setUsername(data.username);
          setUserId(data.userId);
          setProfilePic(data.profile_picture);
        } else {
          setIsValidUser(false);
          console.log("Invalid or Expired Token, Please interact with the bot again.");
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }, [token]);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        // Request access to the user's MetaMask account
        await window.ethereum.request({ method: 'eth_requestAccounts' });

        // Get the user's Ethereum address
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          const address = accounts[0];
          setWalletAddress(address);
          console.log("Wallet connected:", address);

          // Make a POST request to fetch balance
          const response = await fetch('http://localhost:3001/balance', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token, address })
          });

          const responseData = await response.json();
          console.log("Balance response:", responseData);

          setUSDTBalance(responseData.balance);
          setHasBalance(responseData.hasBal);
        }
      } catch (error) {
        console.error("Error connecting wallet:", error);
      }
    } else {
      console.error("MetaMask is not installed");
    }
  };

  const requestLoginSignature = async () => {
    if (!window.ethereum) {
      console.error('MetaMask or another Ethereum provider not found.');
      return;
    } else if (isLoading) {
      console.log('Wait for the last signature to be processed.');
      return;
    }

    try {
      // Request access to the user's MetaMask account
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

      // Get the user's Ethereum address
      const address = accounts[0];

      // Use the token as a nonce
      const nonce = token;

      // Prompt the user to sign the message containing the nonce
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [`Verify Your Wallet (GASLESS) \n$CRYO VERIFICATION \n${nonce}`, address]
      });

      console.log(address, nonce, signature);
      setIsLoading(true);
      setError(false);
      sendToServer({ address, nonce, signature, token });
    } catch (error) {
      console.error('Error:', error);
      if (error.code === 4001) {
        console.log('Transaction rejected');
        setErrorMessage('Transaction Rejected');
        setError(true);
      }
    }
  };

  const sendToServer = async (data) => {
    try {
      const response = await fetch('http://localhost:3001/verify_user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const responseData = await response.json();
        console.log(responseData);
        setErrorMessage(responseData.error);
        setError(true);
        setIsLoading(false);
        throw new Error('Failed to send data to server');
      } else {
        window.location.href = 'http://localhost:3000/success';
      }

      console.log('Data sent to server successfully');
    } catch (error) {
      console.error('Error sending data to server:', error);
    }
  };

  /**
   * Generate a random nonce for authentication purposes.
   * @returns {string} - The generated nonce.
   */
  const generateNonce = () => {
    const randomNonce = Math.random().toString(36).substring(2, 34);
    return randomNonce;
  };

  const truncatedWallet = truncateWalletAddress(walletAddress);
  return (
    <div>
      
      <div className="container">
        <nav>
          <img 
          className="navLogo"
          src="https://assets-global.website-files.com/643d6a447c6e1b4184d3ddfd/643d7ebba7e71c58cdb21f5a_CryoDAO-icon-black.svg" 
          alt="CryoDAO Logo"
          />
          <a href="https://juicebox.money/v2/p/501" target="_blank" className="button is-fund w-button">Juicebox</a>
          </nav>
          
          {isValidUser ? (
            <div className="userWrapper">
              <div className="topWrapper">
                <img className="pfp" src={profilePic} alt="Profile" />
                <div className="TWFlex2">
                  <h2>{username}</h2>
                  <p>{userId}</p>
                  </div>
                  </div>
                  
                  <div className="optionWrapper">
                    {error ? (
                      <p className="warning">
                        <svg 
                        width="28px" 
                        height="28px" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                        >
                          <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                          <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                          <g id="SVGRepo_iconCarrier">
                            <path 
                            d="M12 15H12.01M12 12V9M4.98207 19H19.0179C20.5615 19 21.5233 17.3256 20.7455 15.9923L13.7276 3.96153C12.9558 2.63852 11.0442 2.63852 10.2724 3.96153L3.25452 15.9923C2.47675 17.3256 3.43849 19 4.98207 19Z" 
                            stroke="#ffffff" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                            ></path>
                            </g>
                            </svg>
                            {errorMessage}
                            </p>
                            ) : (
                            <span className="hide"></span>
                            )}
                            
                            {walletAddress ? (
                              <p className="buttonConfirm">{truncatedWallet}</p>
                            ) : (
                            <button className="connect buttonConfirm" onClick={connectWallet}>Connect Wallet</button>
                            )}
                            
                            {walletAddress && (
                              <p className="buttonConfirm">Cryo Balance: {usdtBalance}</p>
                              )}
                              
                              {hasBalance !== null && (
                                <div>
                                  {hasBalance ? (
                                    <button onClick={requestLoginSignature} className="buttonConfirm2">
                                      {isLoading ? (
                                        <div className="lds-ellipsis">
                                          <div></div>
                                          <div></div>
                                          <div></div>
                                          <div></div>
                                          </div>
                                          ) : (
                                          <span>Sign & Verify</span>
                                          )}
                                          </button>
                                          ) : (
                                          <p className="warning">
                                            <svg 
                                            width="28px" 
                                            height="28px" 
                                            viewBox="0 0 24 24" 
                                            fill="none" 
                                            xmlns="http://www.w3.org/2000/svg"
                                            >
                                              <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                                              <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                                              <g id="SVGRepo_iconCarrier">
                                                <path 
                                                d="M12 15H12.01M12 12V9M4.98207 19H19.0179C20.5615 19 21.5233 17.3256 20.7455 15.9923L13.7276 3.96153C12.9558 2.63852 11.0442 2.63852 10.2724 3.96153L3.25452 15.9923C2.47675 17.3256 3.43849 19 4.98207 19Z" 
                                                stroke="#ffffff" 
                                                strokeWidth="2" 
                                                strokeLinecap="round" 
                                                strokeLinejoin="round"
                                                ></path>
                                                </g>
                                                </svg>
                                                No balance detected
                                                </p>
                                              )}
                                              </div>
                                            )}
                                            </div>
                                            </div>
                                            ) : (
                                            <div className="nonUserWrapper">
                                              <h3>An Error Occurred</h3>
                                              <h2>Invalid or Expired URL</h2>
                                              <p>Please interact with the bot again</p>
                                            </div>
                                            )}
                                            </div>

      

      <style>{`
      
      @font-face {
        font-family: 'ABCWhyte';
        src: url('https://uploads-ssl.webflow.com/643d6a447c6e1b4184d3ddfd/643d6d72d2826f7a4110b7f9_ABCWhyte-Medium.otf') format('woff2');
      }

      body{
        background-color: #d8d8d8;
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        font-family: ABCWhyte, sans-serif;
      }
      
      h1, h2, h3, p, a{
        margin: 0;
        padding: 0;
      }
      
      nav{
        padding: 20px 30px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      
      .navLogo{
        width: 48px;
        max-width: 52px;
      }
      
      .button {
        text-align: center;
        background-color: rgba(0, 0, 0, 0);
        background-image: url(https://assets-global.website-files.com/643d6a4…/643d7eb…_button-arrow-right.svg);
        background-position: 100%;
        background-repeat: no-repeat;
        background-size: auto 15px;
        padding: 0 1.75rem 0 0;
        font-size: 1.25rem;
        font-weight: 500;
        text-decoration: underline;
      }
      
      .button.is-fund{
        background-color: #000000;
        color: #ffffff;
        background-image: url("https://assets-global.website-files.com/643d6a447c6e1b4184d3ddfd/643d7ebbfa5ac9c8a4cc598e_CryoDAO-icon-white.svg");
        background-position: 11px;
        background-size: auto 20px;
        border-radius: .25rem;
        padding: .5rem .75rem .5rem 2.5rem;
        font-size: 1rem;
        text-decoration: none;
        transition: background-color .4s;
      }

      @media (max-width:450px){
        .nonUserWrapper{
          width: 90% !important;
          margin: 100px auto 0 auto;
          background-color: #000000;
          border-radius: 20px;
          color: #ffffff;
          box-sizing: border-box;
          padding: 20px;
        }
      }

      .nonUserWrapper{
          width: 400px;
          margin: 100px auto 0 auto;
          background-color: #000000;
          border-radius: 20px;
          color: #ffffff;
          box-sizing: border-box;
          padding: 20px;
      }
      
      .warning{
        background-color: #b3555e;
        border: 3px solid #dc3545;
        border-radius: 5px;
        width: auto;
        padding: 4px 20px 4px 8px;
        display: flex;
        align-items: center;
        gap: 4px;
      }
      
      .userWrapper{
        display: flex;
        align-items: center;
        flex-direction: column;
        width: 400px;
        margin: 100px auto 0 auto;
        background-color: #000000;
        border-radius: 20px;
        color: #ffffff;
      }
      
      .topWrapper{
        width: 350px;
        display: flex;
        align-items: center;
        gap: 20px;
        padding-top: 20px;
      }
      
      .pfp{
        border-radius: 50%;
        height: 70px;
      }
      
      .optionWrapper{
        width: 350px;
        margin: 20px 0;
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
      
      .buttonConfirm{
        background-color: #bebebe;
        border: 2px solid #ffffff;
        color: #000000;
        border-radius: 3px;
        padding: 5px 10px;
        font-family: ABCWhyte, sans-serif;
        transition: 0.3s;
      }
      
      p.buttonConfirm{
        display: flex;
        align-items: center;
        gap: 4px;
      }
      
      .buttonConfirm2{
        background-color: #6a5ff9;
        border: 2px solid #ffffff;
        color: #ffffff;
        border-radius: 3px;
        padding: 5px 10px;
        font-family: ABCWhyte, sans-serif;
        transition: 0.3s;
        
      }

      .buttonConfirm2{
        cursor: pointer;
      }
      
      p.buttonConfirm2{
        display: flex;
        align-items: center;
        gap: 4px;
      }
      
      button.buttonConfirm:hover{
        background-color: #6a5ff9;
        color: #ffffff;
        cursor: pointer;
      }

      .hide{
        display: none;
      }






      .lds-ellipsis {
        display: inline-block;
        position: relative;
        width: 75px;
        height: 14px;
      }
      .lds-ellipsis div {
        position: absolute;
        top: 6px;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #fff;
        animation-timing-function: cubic-bezier(0, 1, 1, 0);
      }
      .lds-ellipsis div:nth-child(1) {
        left: 8px;
        animation: lds-ellipsis1 0.6s infinite;
      }
      .lds-ellipsis div:nth-child(2) {
        left: 8px;
        animation: lds-ellipsis2 0.6s infinite;
      }
      .lds-ellipsis div:nth-child(3) {
        left: 32px;
        animation: lds-ellipsis2 0.6s infinite;
      }
      .lds-ellipsis div:nth-child(4) {
        left: 56px;
        animation: lds-ellipsis3 0.6s infinite;
      }
      @keyframes lds-ellipsis1 {
        0% {
          transform: scale(0);
        }
        100% {
          transform: scale(1);
        }
      }
      @keyframes lds-ellipsis3 {
        0% {
          transform: scale(1);
        }
        100% {
          transform: scale(0);
        }
      }
      @keyframes lds-ellipsis2 {
        0% {
          transform: translate(0, 0);
        }
        100% {
          transform: translate(24px, 0);
        }
      }
      
      `}</style>
    </div>
  );
}

export default ConnectWalletButton;