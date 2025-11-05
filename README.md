# 🎰 Lottery DApp - Frontend

A decentralized lottery application built with Web3.js and Ethereum smart contracts.

## 📋 Features

- **Connect Wallet**: Seamless MetaMask integration
- **Enter Lottery**: Participants can enter by sending 1 ETH
- **Manager Controls**: Contract deployer can select winners
- **Real-time Updates**: Live participant tracking and event notifications
- **Winner Selection**: Random winner selection with prize pool distribution
- **Responsive Design**: Mobile-friendly interface

## 🚀 Getting Started

### Prerequisites

- **MetaMask**: Install [MetaMask browser extension](https://metamask.io/download/)
- **Test ETH**: Get testnet ETH from a faucet (Sepolia, Goerli, etc.)
- **Web Browser**: Modern browser with JavaScript enabled

### Installation

1. **Clone or download this repository**

2. **Deploy the Smart Contract**
   - Open `Lottery.sol` in [Remix IDE](https://remix.ethereum.org/)
   - Compile the contract (Solidity 0.8.20)
   - Deploy to your preferred testnet (Sepolia recommended)
   - Copy the deployed contract address

3. **Configure the Frontend**
   
   Open `app.js` and update the contract address:
   ```javascript
   const CONFIG = {
       CONTRACT_ADDRESS: '0xYourDeployedContractAddress', // Replace this
       ENTRY_FEE: '1',
       MAX_PARTICIPANTS: 10
   };
   ```

4. **Update Contract ABI (if needed)**
   
   If you modify the smart contract, update `contractABI.js`:
   - Compile in Remix
   - Copy the ABI from the compilation details
   - Replace the `CONTRACT_ABI` array in `contractABI.js`

5. **Run the Application**
   
   Option 1 - Simple HTTP Server (Python):
   ```powershell
   python -m http.server 8000
   ```
   
   Option 2 - Node.js HTTP Server:
   ```powershell
   npx http-server -p 8000
   ```
   
   Option 3 - VS Code Live Server:
   - Install "Live Server" extension
   - Right-click on `index.html`
   - Select "Open with Live Server"

6. **Access the Application**
   
   Open your browser and navigate to:
   ```
   http://localhost:8000
   ```

## 📖 How to Use

### For Participants

1. **Connect Your Wallet**
   - Click "Connect Wallet" button
   - Approve MetaMask connection
   - Ensure you're on the correct network

2. **Enter the Lottery**
   - Click "Enter Lottery (1 ETH)" button
   - Confirm the transaction in MetaMask
   - Wait for transaction confirmation

3. **Track Your Entry**
   - View your address in the participants list
   - Monitor the prize pool growth
   - Wait for winner selection

### For Manager (Contract Deployer)

1. **Connect as Manager**
   - Connect with the wallet that deployed the contract
   - Manager controls will appear automatically

2. **Monitor Lottery**
   - View balance and participant count
   - Minimum 3 participants required to select winner

3. **Select Winner**
   - Click "Select Winner" when ready (≥3 participants)
   - Confirm transaction
   - Winner receives entire prize pool
   - Lottery resets automatically

## 🔧 Smart Contract Details

### Contract Functions

- **receive()**: Accepts ETH and adds participant (1 ETH entry fee)
- **Selectwinner()**: Manager-only function to select and pay winner
- **getBalance()**: View current prize pool (manager only)
- **random()**: Generates pseudo-random number for winner selection

### Contract Rules

- Entry fee: **1 ETH**
- Max participants: **10**
- Min participants for winner selection: **3**
- Manager cannot participate
- Winner receives 100% of prize pool

### Events

- `participantsEntered`: Emitted when someone enters
- `WinnerSelected`: Emitted when winner is chosen

## 🔐 Security Notes

⚠️ **Important**: This is an educational project!

- Use **TESTNET ONLY** for development
- Never use real ETH on mainnet without thorough auditing
- The random function is not production-ready (can be manipulated)
- For production, use Chainlink VRF for true randomness

## 🌐 Testnet Resources

### Sepolia Testnet
- **Faucet**: https://sepoliafaucet.com/
- **Explorer**: https://sepolia.etherscan.io/
- **Chain ID**: 11155111

### Goerli Testnet
- **Faucet**: https://goerlifaucet.com/
- **Explorer**: https://goerli.etherscan.io/
- **Chain ID**: 5

## 🐛 Troubleshooting

### MetaMask Not Detected
- Install MetaMask extension
- Refresh the page
- Check browser compatibility

### Transaction Failing
- Ensure sufficient ETH balance (1 ETH + gas fees)
- Check you're on the correct network
- Verify contract address is correct
- Manager cannot participate in lottery

### Lottery Full
- Max 10 participants allowed
- Wait for manager to select winner and reset
- Or deploy a new contract instance

### Winner Selection Fails
- Requires minimum 3 participants
- Only manager can select winner
- Ensure sufficient gas for transaction

## 📱 Browser Compatibility

- ✅ Chrome/Brave (Recommended)
- ✅ Firefox
- ✅ Edge
- ⚠️ Safari (Limited Web3 support)

## 🤝 Contributing

Feel free to fork, modify, and improve this project!

## 📄 License

MIT License - Use at your own risk

## 🎓 Learning Resources

- [Solidity Documentation](https://docs.soliditylang.org/)
- [Web3.js Documentation](https://web3js.readthedocs.io/)
- [MetaMask Documentation](https://docs.metamask.io/)
- [Remix IDE](https://remix.ethereum.org/)

---

**Happy Coding! 🚀**
