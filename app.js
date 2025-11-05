// Configuration
const CONFIG = {
    // Replace with your deployed contract address
    CONTRACT_ADDRESS: '0xB9e2A2008d3A58adD8CC1cE9c15BF6D4bB9C6d72',
    ENTRY_FEE: '1',
    MAX_PARTICIPANTS: 10
};

// State
let web3;
let contract;
let userAccount;
let isManager = false;

// DOM Elements
const elements = {
    connectWallet: document.getElementById('connectWallet'),
    walletInfo: document.getElementById('walletInfo'),
    userAddress: document.getElementById('userAddress'),
    userRole: document.getElementById('userRole'),
    prizePool: document.getElementById('prizePool'),
    participantCount: document.getElementById('participantCount'),
    managerAddress: document.getElementById('managerAddress'),
    enterLottery: document.getElementById('enterLottery'),
    selectWinner: document.getElementById('selectWinner'),
    refreshBalance: document.getElementById('refreshBalance'),
    participantsList: document.getElementById('participantsList'),
    participantSection: document.getElementById('participantSection'),
    managerSection: document.getElementById('managerSection'),
    participantMessage: document.getElementById('participantMessage'),
    managerMessage: document.getElementById('managerMessage'),
    winnerCard: document.getElementById('winnerCard'),
    winnerInfo: document.getElementById('winnerInfo'),
    toast: document.getElementById('toast'),
    loadingOverlay: document.getElementById('loadingOverlay')
};

// Initialize the app
async function init() {
    // Check if MetaMask is installed
    if (typeof window.ethereum !== 'undefined') {
        console.log('MetaMask is installed!');
    } else {
        showToast('Please install MetaMask to use this dApp!', 'error');
        elements.connectWallet.textContent = 'Install MetaMask';
        elements.connectWallet.onclick = () => {
            window.open('https://metamask.io/download/', '_blank');
        };
        return;
    }

    // Set up event listeners
    elements.connectWallet.addEventListener('click', connectWallet);
    elements.enterLottery.addEventListener('click', enterLottery);
    elements.selectWinner.addEventListener('click', selectWinner);
    elements.refreshBalance.addEventListener('click', updateLotteryData);

    // Listen for account changes
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', () => window.location.reload());
}

// Connect Wallet
async function connectWallet() {
    try {
        showLoading(true);
        
        // Request account access
        const accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
        });
        
        // Initialize Web3
        web3 = new Web3(window.ethereum);
        userAccount = accounts[0];

        // Initialize contract
        contract = new web3.eth.Contract(CONTRACT_ABI, CONFIG.CONTRACT_ADDRESS);

        // Update UI
        elements.connectWallet.classList.add('hidden');
        elements.walletInfo.classList.remove('hidden');
        elements.userAddress.textContent = formatAddress(userAccount);

        // Check if user is manager
        const manager = await contract.methods.manager().call();
        isManager = manager.toLowerCase() === userAccount.toLowerCase();
        elements.userRole.textContent = isManager ? 'Manager' : 'Participant';

        // Show appropriate sections
        if (isManager) {
            elements.managerSection.classList.remove('hidden');
        }

        // Load lottery data
        await updateLotteryData();

        // Set up event listeners
        subscribeToEvents();

        showToast('Wallet connected successfully!', 'success');
    } catch (error) {
        console.error('Error connecting wallet:', error);
        showToast('Error connecting wallet: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// Handle account changes
async function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        // User disconnected wallet
        window.location.reload();
    } else if (accounts[0] !== userAccount) {
        // User switched account
        window.location.reload();
    }
}

// Update lottery data
async function updateLotteryData() {
    try {
        // Get manager address
        const manager = await contract.methods.manager().call();
        elements.managerAddress.textContent = formatAddress(manager);

        // Get balance
        const balance = await web3.eth.getBalance(CONFIG.CONTRACT_ADDRESS);
        const balanceInEth = web3.utils.fromWei(balance, 'ether');
        elements.prizePool.textContent = parseFloat(balanceInEth).toFixed(2) + ' ETH';

        // Get participants
        const participants = await getParticipants();
        elements.participantCount.textContent = `${participants.length}/${CONFIG.MAX_PARTICIPANTS}`;

        // Update participants list
        updateParticipantsList(participants);

        // Update button states
        updateButtonStates(participants.length);

    } catch (error) {
        console.error('Error updating lottery data:', error);
        showToast('Error loading lottery data', 'error');
    }
}

// Get all participants
async function getParticipants() {
    const participants = [];
    let index = 0;
    
    try {
        while (index < CONFIG.MAX_PARTICIPANTS) {
            const participant = await contract.methods.participants(index).call();
            if (participant === '0x0000000000000000000000000000000000000000') {
                break;
            }
            participants.push(participant);
            index++;
        }
    } catch (error) {
        // No more participants
    }
    
    return participants;
}

// Update participants list
function updateParticipantsList(participants) {
    if (participants.length === 0) {
        elements.participantsList.innerHTML = '<p class="empty-state">No participants yet. Be the first to enter!</p>';
        return;
    }

    elements.participantsList.innerHTML = participants
        .map((address, index) => `
            <div class="participant-item">
                ${index + 1}. ${formatAddress(address)}
            </div>
        `)
        .join('');
}

// Update button states
function updateButtonStates(participantCount) {
    // Enter lottery button
    if (isManager) {
        elements.enterLottery.disabled = true;
        elements.enterLottery.textContent = 'Managers Cannot Participate';
    } else if (participantCount >= CONFIG.MAX_PARTICIPANTS) {
        elements.enterLottery.disabled = true;
        elements.enterLottery.textContent = 'Lottery Full';
    } else {
        elements.enterLottery.disabled = false;
        elements.enterLottery.textContent = 'Enter Lottery (1 ETH)';
    }

    // Select winner button
    if (isManager) {
        if (participantCount < 3) {
            elements.selectWinner.disabled = true;
            elements.selectWinner.textContent = `Select Winner (Need ${3 - participantCount} more)`;
        } else {
            elements.selectWinner.disabled = false;
            elements.selectWinner.textContent = 'Select Winner';
        }
    }
}

// Enter lottery
async function enterLottery() {
    try {
        showLoading(true);
        hideMessage(elements.participantMessage);

        // Send transaction
        const tx = await web3.eth.sendTransaction({
            from: userAccount,
            to: CONFIG.CONTRACT_ADDRESS,
            value: web3.utils.toWei(CONFIG.ENTRY_FEE, 'ether')
        });

        showMessage(elements.participantMessage, 
            `Successfully entered the lottery! TX: ${formatAddress(tx.transactionHash)}`, 
            'success');
        showToast('Successfully entered the lottery!', 'success');

        // Update data
        await updateLotteryData();

    } catch (error) {
        console.error('Error entering lottery:', error);
        let errorMessage = 'Error entering lottery: ';
        
        if (error.message.includes('Manager cant Participate')) {
            errorMessage += 'Managers cannot participate!';
        } else if (error.message.includes('No more people can participate')) {
            errorMessage += 'Lottery is full!';
        } else {
            errorMessage += error.message;
        }
        
        showMessage(elements.participantMessage, errorMessage, 'error');
        showToast(errorMessage, 'error');
    } finally {
        showLoading(false);
    }
}

// Select winner (Manager only)
async function selectWinner() {
    try {
        showLoading(true);
        hideMessage(elements.managerMessage);

        // Call selectWinner function
        const tx = await contract.methods.Selectwinner().send({
            from: userAccount
        });

        showMessage(elements.managerMessage, 
            'Winner selected successfully! Check the winner card below.', 
            'success');
        showToast('Winner selected successfully!', 'success');

        // Update data
        await updateLotteryData();

    } catch (error) {
        console.error('Error selecting winner:', error);
        let errorMessage = 'Error selecting winner: ';
        
        if (error.message.includes('Not Authorized')) {
            errorMessage += 'Only the manager can select a winner!';
        } else if (error.message.includes('require')) {
            errorMessage += 'Need at least 3 participants!';
        } else {
            errorMessage += error.message;
        }
        
        showMessage(elements.managerMessage, errorMessage, 'error');
        showToast(errorMessage, 'error');
    } finally {
        showLoading(false);
    }
}

// Subscribe to contract events
function subscribeToEvents() {
    // Listen for ParticipantsEntered event
    contract.events.participantsEntered({
        fromBlock: 'latest'
    })
    .on('data', async (event) => {
        console.log('New participant:', event.returnValues.participants);
        showToast('New participant entered!', 'info');
        await updateLotteryData();
    })
    .on('error', console.error);

    // Listen for WinnerSelected event
    contract.events.WinnerSelected({
        fromBlock: 'latest'
    })
    .on('data', async (event) => {
        const winner = event.returnValues.winner;
        const amount = web3.utils.fromWei(event.returnValues.win_amount, 'ether');
        
        console.log('Winner selected:', winner, 'Amount:', amount);
        
        // Show winner card
        elements.winnerCard.classList.remove('hidden');
        elements.winnerInfo.innerHTML = `
            <h3>🎉 Congratulations! 🎉</h3>
            <p class="winner-address">${formatAddress(winner)}</p>
            <p>Won: <strong>${parseFloat(amount).toFixed(2)} ETH</strong></p>
        `;
        
        showToast(`Winner selected! ${formatAddress(winner)} won ${parseFloat(amount).toFixed(2)} ETH`, 'success');
        await updateLotteryData();
    })
    .on('error', console.error);
}

// Utility functions
function formatAddress(address) {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

function showToast(message, type = 'info') {
    elements.toast.textContent = message;
    elements.toast.className = `toast ${type}`;
    elements.toast.classList.remove('hidden');
    
    setTimeout(() => {
        elements.toast.classList.add('hidden');
    }, 5000);
}

function showMessage(element, message, type) {
    element.textContent = message;
    element.className = `message ${type}`;
    element.classList.remove('hidden');
}

function hideMessage(element) {
    element.classList.add('hidden');
}

function showLoading(show) {
    if (show) {
        elements.loadingOverlay.classList.remove('hidden');
    } else {
        elements.loadingOverlay.classList.add('hidden');
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', init);
