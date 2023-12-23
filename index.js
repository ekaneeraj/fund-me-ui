import { abi, contractAddress } from './constants.js';
import { ethers } from './ethers-5.7.esm.min.js';

const connectButton = document.getElementById('connectWallet');
const balanceButton = document.getElementById('balance');
const withdrawButton = document.getElementById('withdraw');
const fundButton = document.getElementById('fund');

connectButton.onclick = connect;
balanceButton.onclick = getBalance;
withdrawButton.onclick = withdraw;
fundButton.onclick = fund;
console.log(ethers);

async function connect() {
  if (typeof window.ethereum !== 'undefined') {
    console.log('metamask available!');
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    connectButton.innerHTML = 'Connected';
  } else {
    connect.innerHTML = 'Please install metamask';
  }
}

async function getBalance() {
  if (typeof window.ethereum !== 'undefined') {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balance = await provider.getBalance(contractAddress);
    console.log(ethers.utils.formatEther(balance));
  }
}

async function fund() {
  const ethAmount = document.getElementById('ethAmount').value;
  console.log(`Funding with ${ethAmount}`);
  if (typeof window.ethereum !== 'undefined') {
    // provider
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    // signer
    const singer = provider.getSigner();
    console.log(singer.getAddress());
    //contract ABI and address
    const contract = new ethers.Contract(contractAddress, abi, singer);

    try {
      const transactionResponse = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      });
      await listenForTransactionMine(transactionResponse, provider);
      console.log('Completed!');
    } catch (error) {
      console.log(error);
    }
  }
}

function listenForTransactionMine(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash}`);
  return new Promise((resolve, reject) => {
    provider.once(transactionResponse.hash, (transactionReceipt) => {
      console.log(
        `Completed with ${transactionReceipt.confirmations} confirmations`
      );
      resolve();
    });
  });
}

async function withdraw() {
  if (typeof window.ethereum !== 'undefined') {
    console.log(`Withdrawing..`);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const singer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, singer);

    try {
      const transactionResponse = await contract.withdraw();
      await listenForTransactionMine(transactionResponse, provider);
      console.log('Completed!');
    } catch (error) {
      console.log(error);
    }
  }
}
