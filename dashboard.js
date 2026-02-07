let currentUser = null;

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const userSession = sessionStorage.getItem('currentUser');
    if (!userSession) {
        window.location.href = 'index.html';
        return;
    }

    currentUser = JSON.parse(userSession);
    initializeDashboard();
});

function initializeDashboard() {
    // Set welcome message
    document.getElementById('welcomeUser').textContent = currentUser.name;
    
    // Set profile name in settings
    const profileNameField = document.getElementById('profileName');
    if (profileNameField) {
        profileNameField.value = currentUser.name;
    }

    // Set card holder names
    const cardHolder1 = document.getElementById('cardHolder1');
    const cardHolder2 = document.getElementById('cardHolder2');
    if (cardHolder1) cardHolder1.textContent = currentUser.name.toUpperCase();
    if (cardHolder2) cardHolder2.textContent = currentUser.name.toUpperCase();

    // Logout functionality
    document.getElementById('logoutBtn').addEventListener('click', function() {
        sessionStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });

    // Navigation
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            switchSection(section);
            
            menuItems.forEach(mi => mi.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Initialize sections
    loadDashboard();
    loadAccounts();
    loadTransferForm();
    loadTransactions();
    loadBeneficiaries();
    loadStatementAccounts();

    // Event listeners
    document.getElementById('transferForm').addEventListener('submit', handleTransfer);
    document.getElementById('addBeneficiaryBtn').addEventListener('click', showBeneficiaryForm);
    document.getElementById('cancelBeneficiary').addEventListener('click', hideBeneficiaryForm);
    document.getElementById('beneficiaryForm').addEventListener('submit', handleAddBeneficiary);
    document.getElementById('filterBtn').addEventListener('click', loadTransactions);
}

function switchSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
}

// Make this function globally available for quick actions
window.switchToSection = function(sectionId) {
    switchSection(sectionId);
    
    // Update active menu item
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        if (item.getAttribute('data-section') === sectionId) {
            menuItems.forEach(mi => mi.classList.remove('active'));
            item.classList.add('active');
        }
    });
};

function loadDashboard() {
    // Calculate total balance
    let totalBalance = 0;
    currentUser.accounts.forEach(account => {
        totalBalance += account.balance;
    });
    
    const totalBalanceElement = document.getElementById('totalBalance');
    if (totalBalanceElement) {
        totalBalanceElement.textContent = `$${totalBalance.toFixed(2)}`;
    }

    // Load recent transactions
    const recentTransactions = document.getElementById('recentTransactions');
    if (recentTransactions) {
        const transactions = StorageManager.getTransactions(currentUser.id).slice(0, 5);
        
        if (transactions.length === 0) {
            recentTransactions.innerHTML = '<p style="text-align: center; padding: 20px; color: #999;">No recent transactions</p>';
        } else {
            recentTransactions.innerHTML = '';
            transactions.forEach(txn => {
                const txnItem = document.createElement('div');
                txnItem.className = 'transaction-item';
                txnItem.innerHTML = `
                    <div class="transaction-details">
                        <div class="transaction-type">${txn.description}</div>
                        <div class="transaction-date">${txn.date}</div>
                    </div>
                    <div class="transaction-amount ${txn.type}">
                        ${txn.type === 'credit' ? '+' : '-'}$${txn.amount.toFixed(2)}
                    </div>
                `;
                recentTransactions.appendChild(txnItem);
            });
        }
    }
}

function loadAccounts() {
    const accountsList = document.getElementById('accountsList');
    accountsList.innerHTML = '';

    currentUser.accounts.forEach(account => {
        const accountCard = document.createElement('div');
        accountCard.className = 'account-card';
        accountCard.innerHTML = `
            <div class="account-type">${account.type}</div>
            <div class="account-number">**** **** ${account.number.slice(-4)}</div>
            <div class="account-balance">$${account.balance.toFixed(2)}</div>
        `;
        accountsList.appendChild(accountCard);
    });
}

function loadTransferForm() {
    const fromAccount = document.getElementById('fromAccount');
    const toBeneficiary = document.getElementById('toBeneficiary');

    // Populate from accounts
    fromAccount.innerHTML = '';
    currentUser.accounts.forEach(account => {
        const option = document.createElement('option');
        option.value = account.id;
        option.textContent = `${account.type} - **** ${account.number.slice(-4)} ($${account.balance.toFixed(2)})`;
        fromAccount.appendChild(option);
    });

    // Populate beneficiaries
    const beneficiaries = StorageManager.getBeneficiaries(currentUser.id);
    toBeneficiary.innerHTML = '<option value="">Select beneficiary</option>';
    beneficiaries.forEach(ben => {
        const option = document.createElement('option');
        option.value = ben.id;
        option.textContent = `${ben.name} - ${ben.bank}`;
        toBeneficiary.appendChild(option);
    });
}

function handleTransfer(e) {
    e.preventDefault();
    
    const fromAccountId = document.getElementById('fromAccount').value;
    const toBeneficiaryId = document.getElementById('toBeneficiary').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const remarks = document.getElementById('remarks').value || 'Transfer';
    const messageDiv = document.getElementById('transferMessage');

    if (!toBeneficiaryId) {
        messageDiv.className = 'message error';
        messageDiv.textContent = 'Please select a beneficiary!';
        return;
    }

    // Find account
    const account = currentUser.accounts.find(acc => acc.id === fromAccountId);
    
    if (account.balance < amount) {
        messageDiv.className = 'message error';
        messageDiv.textContent = 'Insufficient balance!';
        setTimeout(() => {
            messageDiv.textContent = '';
            messageDiv.className = 'message';
        }, 3000);
        return;
    }

    // Find beneficiary name
    const beneficiaries = StorageManager.getBeneficiaries(currentUser.id);
    const beneficiary = beneficiaries.find(b => b.id === toBeneficiaryId);

    // Update balance
    account.balance -= amount;
    StorageManager.updateUser(currentUser.id, currentUser);

    // Add transaction
    const transaction = {
        id: 'txn' + Date.now(),
        accountId: fromAccountId,
        type: 'debit',
        amount: amount,
        description: `Transfer to ${beneficiary.name} - ${remarks}`,
        date: new Date().toISOString().split('T')[0],
        balance: account.balance
    };
    StorageManager.addTransaction(currentUser.id, transaction);

    messageDiv.className = 'message success';
    messageDiv.textContent = `Successfully transferred $${amount.toFixed(2)} to ${beneficiary.name}!`;
    
    // Reset form
    e.target.reset();
    loadAccounts();
    loadTransactions();
    loadDashboard();

    setTimeout(() => {
        messageDiv.textContent = '';
        messageDiv.className = 'message';
    }, 3000);
}

function loadTransactions() {
    const transactionsList = document.getElementById('transactionsList');
    const accountFilter = document.getElementById('accountFilter').value;
    
    let transactions = StorageManager.getTransactions(currentUser.id);

    // Populate account filter if empty
    const filterSelect = document.getElementById('accountFilter');
    if (filterSelect.options.length === 1) {
        currentUser.accounts.forEach(account => {
            const option = document.createElement('option');
            option.value = account.id;
            option.textContent = `${account.type} - **** ${account.number.slice(-4)}`;
            filterSelect.appendChild(option);
        });
    }

    // Filter by account
    if (accountFilter !== 'all') {
        transactions = transactions.filter(t => t.accountId === accountFilter);
    }

    // Filter by date
    const dateFrom = document.getElementById('dateFrom').value;
    const dateTo = document.getElementById('dateTo').value;
    
    if (dateFrom) {
        transactions = transactions.filter(t => t.date >= dateFrom);
    }
    if (dateTo) {
        transactions = transactions.filter(t => t.date <= dateTo);
    }

    transactionsList.innerHTML = '';
    
    if (transactions.length === 0) {
        transactionsList.innerHTML = '<p style="text-align: center; padding: 20px; color: #999;">No transactions found</p>';
        return;
    }

    transactions.forEach(txn => {
        const txnItem = document.createElement('div');
        txnItem.className = 'transaction-item';
        txnItem.innerHTML = `
            <div class="transaction-details">
                <div class="transaction-type">${txn.description}</div>
                <div class="transaction-date">${txn.date}</div>
            </div>
            <div class="transaction-amount ${txn.type}">
                ${txn.type === 'credit' ? '+' : '-'}$${txn.amount.toFixed(2)}
            </div>
        `;
        transactionsList.appendChild(txnItem);
    });
}

function loadBeneficiaries() {
    const beneficiariesList = document.getElementById('beneficiariesList');
    const beneficiaries = StorageManager.getBeneficiaries(currentUser.id);

    beneficiariesList.innerHTML = '';

    if (beneficiaries.length === 0) {
        beneficiariesList.innerHTML = '<p style="text-align: center; padding: 20px; color: #999;">No beneficiaries added yet</p>';
        return;
    }

    beneficiaries.forEach(ben => {
        const benCard = document.createElement('div');
        benCard.className = 'beneficiary-card';
        benCard.innerHTML = `
            <button class="delete-beneficiary" onclick="deleteBeneficiary('${ben.id}')">×</button>
            <div class="beneficiary-name">${ben.name}</div>
            <div class="beneficiary-details">
                <div>Account: ${ben.account}</div>
                <div>Bank: ${ben.bank}</div>
            </div>
        `;
        beneficiariesList.appendChild(benCard);
    });
}

function showBeneficiaryForm() {
    document.getElementById('addBeneficiaryForm').style.display = 'block';
}

function hideBeneficiaryForm() {
    document.getElementById('addBeneficiaryForm').style.display = 'none';
    document.getElementById('beneficiaryForm').reset();
}

function handleAddBeneficiary(e) {
    e.preventDefault();
    
    const beneficiary = {
        id: 'ben' + Date.now(),
        name: document.getElementById('beneficiaryName').value,
        account: document.getElementById('beneficiaryAccount').value,
        bank: document.getElementById('beneficiaryBank').value
    };

    StorageManager.addBeneficiary(currentUser.id, beneficiary);
    loadBeneficiaries();
    loadTransferForm();
    hideBeneficiaryForm();
}

window.deleteBeneficiary = function(beneficiaryId) {
    if (confirm('Are you sure you want to delete this beneficiary?')) {
        StorageManager.deleteBeneficiary(currentUser.id, beneficiaryId);
        loadBeneficiaries();
        loadTransferForm();
    }
};

function loadStatementAccounts() {
    const statementAccount = document.getElementById('statementAccount');
    if (statementAccount && statementAccount.options.length === 1) {
        currentUser.accounts.forEach(account => {
            const option = document.createElement('option');
            option.value = account.id;
            option.textContent = `${account.type} - **** ${account.number.slice(-4)}`;
            statementAccount.appendChild(option);
        });
    }
}
// Loan Application Functions
let loanApplications = JSON.parse(localStorage.getItem('starterbank_loans_' + (currentUser ? currentUser.id : '')) || '[]');

window.openLoanForm = function(loanType, maxAmount, tenures) {
    document.getElementById('loanFormTitle').textContent = `Apply for ${loanType}`;
    document.getElementById('loanType').value = loanType;
    document.getElementById('loanAmount').max = maxAmount;
    
    // Update tenure options based on loan type
    const tenureSelect = document.getElementById('loanTenure');
    tenureSelect.innerHTML = '<option value="">Select tenure</option>';
    tenures.split(',').forEach(tenure => {
        const option = document.createElement('option');
        option.value = tenure;
        option.textContent = `${tenure} Year${tenure > 1 ? 's' : ''}`;
        tenureSelect.appendChild(option);
    });
    
    // Prefill user name
    document.getElementById('fullName').value = currentUser.name;
    
    // Show form and hide loan cards
    document.getElementById('loanApplicationForm').style.display = 'block';
    document.getElementById('loanOptionsCards').style.display = 'none';
    
    // Scroll to form
    document.getElementById('loanApplicationForm').scrollIntoView({ behavior: 'smooth' });
};

window.closeLoanForm = function() {
    document.getElementById('loanApplicationForm').style.display = 'none';
    document.getElementById('loanOptionsCards').style.display = 'grid';
    document.getElementById('loanForm').reset();
    document.getElementById('loanMessage').textContent = '';
    document.getElementById('loanMessage').className = 'message';
};

// Handle Loan Form Submission
document.addEventListener('DOMContentLoaded', function() {
    const loanForm = document.getElementById('loanForm');
    if (loanForm) {
        loanForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const loanApplication = {
                id: 'loan' + Date.now(),
                type: document.getElementById('loanType').value,
                amount: parseFloat(document.getElementById('loanAmount').value),
                tenure: document.getElementById('loanTenure').value,
                employmentType: document.getElementById('employmentType').value,
                monthlyIncome: parseFloat(document.getElementById('monthlyIncome').value),
                fullName: document.getElementById('fullName').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                panNumber: document.getElementById('panNumber').value,
                address: document.getElementById('address').value,
                purpose: document.getElementById('purpose').value,
                status: 'pending',
                applicationDate: new Date().toISOString().split('T')[0]
            };
            
            // Save to localStorage
            loanApplications.push(loanApplication);
            localStorage.setItem('starterbank_loans_' + currentUser.id, JSON.stringify(loanApplications));
            
            // Show success message
            const messageDiv = document.getElementById('loanMessage');
            messageDiv.className = 'message success';
            messageDiv.textContent = '🎉 Loan application submitted successfully! Our team will review your application and contact you within 24-48 hours.';
            
            // Reset form after delay
            setTimeout(() => {
                closeLoanForm();
                loadMyLoans();
            }, 3000);
        });
    }
});

function loadMyLoans() {
    const myLoansList = document.getElementById('myLoansList');
    const loans = JSON.parse(localStorage.getItem('starterbank_loans_' + currentUser.id) || '[]');
    
    if (loans.length === 0) {
        myLoansList.innerHTML = '<p style="text-align: center; padding: 20px; color: #999;">No loan applications yet</p>';
        return;
    }
    
    myLoansList.innerHTML = '';
    loans.reverse().forEach(loan => {
        const loanItem = document.createElement('div');
        loanItem.className = 'loan-application-item';
        loanItem.innerHTML = `
            <div class="loan-app-details">
                <h4>${loan.type}</h4>
                <div class="loan-app-info">
                    <span>Amount: $${loan.amount.toLocaleString()}</span>
                    <span>Tenure: ${loan.tenure} years</span>
                    <span>Applied: ${loan.applicationDate}</span>
                </div>
            </div>
            <span class="loan-status ${loan.status}">${loan.status.toUpperCase()}</span>
        `;
        myLoansList.appendChild(loanItem);
    });
}

// Enhanced Transaction Filtering
function initializeTransactionFilters() {
    const dateRangeSelect = document.getElementById('dateRange');
    const customDateInputs = document.getElementById('customDateInputs');
    const resetFilterBtn = document.getElementById('resetFilterBtn');
    
    if (dateRangeSelect) {
        dateRangeSelect.addEventListener('change', function() {
            if (this.value === 'custom') {
                customDateInputs.style.display = 'flex';
            } else {
                customDateInputs.style.display = 'none';
            }
        });
    }
    
    if (resetFilterBtn) {
        resetFilterBtn.addEventListener('click', function() {
            document.getElementById('accountFilter').value = 'all';
            document.getElementById('transactionType').value = 'all';
            document.getElementById('dateRange').value = 'all';
            customDateInputs.style.display = 'none';
            document.getElementById('dateFrom').value = '';
            document.getElementById('dateTo').value = '';
            loadTransactions();
        });
    }
}

// Update loadTransactions function
function loadTransactions() {
    const transactionsList = document.getElementById('transactionsList');
    const accountFilter = document.getElementById('accountFilter').value;
    const typeFilter = document.getElementById('transactionType').value;
    const dateRange = document.getElementById('dateRange').value;
    
    let transactions = StorageManager.getTransactions(currentUser.id);

    // Populate account filter if empty
    const filterSelect = document.getElementById('accountFilter');
    if (filterSelect && filterSelect.options.length === 1) {
        currentUser.accounts.forEach(account => {
            const option = document.createElement('option');
            option.value = account.id;
            option.textContent = `${account.type} - **** ${account.number.slice(-4)}`;
            filterSelect.appendChild(option);
        });
    }

    // Filter by account
    if (accountFilter !== 'all') {
        transactions = transactions.filter(t => t.accountId === accountFilter);
    }
    
    // Filter by type
    if (typeFilter !== 'all') {
        transactions = transactions.filter(t => t.type === typeFilter);
    }
    
    // Filter by date range
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    if (dateRange === 'today') {
        transactions = transactions.filter(t => t.date === todayStr);
    } else if (dateRange === 'week') {
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const weekAgoStr = weekAgo.toISOString().split('T')[0];
        transactions = transactions.filter(t => t.date >= weekAgoStr);
    } else if (dateRange === 'month') {
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        const monthAgoStr = monthAgo.toISOString().split('T')[0];
        transactions = transactions.filter(t => t.date >= monthAgoStr);
    } else if (dateRange === 'custom') {
        const dateFrom = document.getElementById('dateFrom').value;
        const dateTo = document.getElementById('dateTo').value;
        
        if (dateFrom) {
            transactions = transactions.filter(t => t.date >= dateFrom);
        }
        if (dateTo) {
            transactions = transactions.filter(t => t.date <= dateTo);
        }
    }

    transactionsList.innerHTML = '';
    
    if (transactions.length === 0) {
        transactionsList.innerHTML = '<p style="text-align: center; padding: 20px; color: #999;">No transactions found</p>';
        return;
    }

    transactions.forEach(txn => {
        const txnItem = document.createElement('div');
        txnItem.className = 'transaction-item';
        txnItem.innerHTML = `
            <div class="transaction-details">
                <div class="transaction-type">${txn.description}</div>
                <div class="transaction-date">${txn.date}</div>
            </div>
            <div class="transaction-amount ${txn.type}">
                ${txn.type === 'credit' ? '+' : '-'}$${txn.amount.toFixed(2)}
            </div>
        `;
        transactionsList.appendChild(txnItem);
    });
}

// Initialize filters when dashboard loads
if (document.getElementById('dateRange')) {
    initializeTransactionFilters();
}

// Load loans when section is viewed
if (document.getElementById('myLoansList')) {
    loadMyLoans();
}