// Initialize localStorage with demo data
const StorageManager = {
    init() {
        if (!localStorage.getItem('starterbank_initialized')) {
            this.initializeData();
        }
    },

    initializeData() {
        // Demo users
        const users = [
            {
                id: 'user1',
                username: 'demo',
                password: 'demo123',
                name: 'Demo User',
                accounts: [
                    { id: 'acc1', type: 'Savings Account', number: '1234567890', balance: 25000.00 },
                    { id: 'acc2', type: 'Current Account', number: '0987654321', balance: 15000.00 }
                ]
            },
            {
                id: 'user2',
                username: 'john',
                password: 'john123',
                name: 'John Doe',
                accounts: [
                    { id: 'acc3', type: 'Savings Account', number: '1122334455', balance: 50000.00 },
                    { id: 'acc4', type: 'Current Account', number: '5544332211', balance: 30000.00 }
                ]
            }
        ];

        // Demo beneficiaries - Updated with your exact names
        const beneficiaries = {
            user1: [
                { id: 'ben1', name: 'Pranith Reddy', account: '9876543210', bank: 'HDFC Bank' },
                { id: 'ben2', name: 'Dinesh Reddy', account: '5432167890', bank: 'ICICI Bank' },
                { id: 'ben3', name: 'Kalyan Kumar', account: '7891234560', bank: 'SBI Bank' },
                { id: 'ben4', name: 'Rohit Reddy', account: '4567891230', bank: 'Axis Bank' },
                { id: 'ben5', name: 'Srikanth Sardar', account: '3216549870', bank: 'Kotak Bank' },
                { id: 'ben6', name: 'Sai Kumar', account: '6549873210', bank: 'HDFC Bank' },
                { id: 'ben7', name: 'Satya G', account: '9873216540', bank: 'ICICI Bank' }
            ],
            user2: [
                { id: 'ben8', name: 'Pranith Reddy', account: '1231231234', bank: 'SBI Bank' },
                { id: 'ben9', name: 'Dinesh Reddy', account: '4564564567', bank: 'Axis Bank' },
                { id: 'ben10', name: 'Kalyan Kumar', account: '7897897890', bank: 'HDFC Bank' },
                { id: 'ben11', name: 'Rohit Reddy', account: '3213213210', bank: 'ICICI Bank' },
                { id: 'ben12', name: 'Srikanth Sardar', account: '6546546540', bank: 'Kotak Bank' },
                { id: 'ben13', name: 'Sai Kumar', account: '9879879870', bank: 'SBI Bank' },
                { id: 'ben14', name: 'Satya G', account: '1472583690', bank: 'Axis Bank' }
            ]
        };

        // Demo transactions
        const transactions = {
            user1: [
                {
                    id: 'txn1',
                    accountId: 'acc1',
                    type: 'credit',
                    amount: 5000,
                    description: 'Salary Credit',
                    date: '2026-02-01',
                    balance: 25000
                },
                {
                    id: 'txn2',
                    accountId: 'acc1',
                    type: 'debit',
                    amount: 500,
                    description: 'Transfer to Pranith Reddy',
                    date: '2026-02-03',
                    balance: 24500
                },
                {
                    id: 'txn3',
                    accountId: 'acc2',
                    type: 'credit',
                    amount: 2000,
                    description: 'Received from Dinesh Reddy',
                    date: '2026-02-04',
                    balance: 15000
                },
                {
                    id: 'txn4',
                    accountId: 'acc1',
                    type: 'debit',
                    amount: 1200,
                    description: 'Transfer to Kalyan Kumar',
                    date: '2026-02-05',
                    balance: 23300
                },
                {
                    id: 'txn5',
                    accountId: 'acc1',
                    type: 'debit',
                    amount: 800,
                    description: 'Transfer to Rohit Reddy',
                    date: '2026-02-06',
                    balance: 22500
                },
                {
                    id: 'txn6',
                    accountId: 'acc2',
                    type: 'credit',
                    amount: 1500,
                    description: 'Received from Sai Kumar',
                    date: '2026-02-06',
                    balance: 16500
                },
                {
                    id: 'txn7',
                    accountId: 'acc1',
                    type: 'debit',
                    amount: 600,
                    description: 'Transfer to Satya G',
                    date: '2026-02-07',
                    balance: 21900
                }
            ],
            user2: [
                {
                    id: 'txn8',
                    accountId: 'acc3',
                    type: 'credit',
                    amount: 10000,
                    description: 'Transfer Received from Srikanth Sardar',
                    date: '2026-02-05',
                    balance: 50000
                },
                {
                    id: 'txn9',
                    accountId: 'acc3',
                    type: 'debit',
                    amount: 2500,
                    description: 'Transfer to Kalyan Kumar',
                    date: '2026-02-06',
                    balance: 47500
                },
                {
                    id: 'txn10',
                    accountId: 'acc4',
                    type: 'credit',
                    amount: 5000,
                    description: 'Received from Sai Kumar',
                    date: '2026-02-07',
                    balance: 30000
                }
            ]
        };

        localStorage.setItem('starterbank_users', JSON.stringify(users));
        localStorage.setItem('starterbank_beneficiaries', JSON.stringify(beneficiaries));
        localStorage.setItem('starterbank_transactions', JSON.stringify(transactions));
        localStorage.setItem('starterbank_initialized', 'true');
    },

    getUsers() {
        return JSON.parse(localStorage.getItem('starterbank_users') || '[]');
    },

    getUser(userId) {
        const users = this.getUsers();
        return users.find(u => u.id === userId);
    },

    updateUser(userId, userData) {
        const users = this.getUsers();
        const index = users.findIndex(u => u.id === userId);
        if (index !== -1) {
            users[index] = { ...users[index], ...userData };
            localStorage.setItem('starterbank_users', JSON.stringify(users));
        }
    },

    getBeneficiaries(userId) {
        const beneficiaries = JSON.parse(localStorage.getItem('starterbank_beneficiaries') || '{}');
        return beneficiaries[userId] || [];
    },

    addBeneficiary(userId, beneficiary) {
        const beneficiaries = JSON.parse(localStorage.getItem('starterbank_beneficiaries') || '{}');
        if (!beneficiaries[userId]) {
            beneficiaries[userId] = [];
        }
        beneficiaries[userId].push(beneficiary);
        localStorage.setItem('starterbank_beneficiaries', JSON.stringify(beneficiaries));
    },

    deleteBeneficiary(userId, beneficiaryId) {
        const beneficiaries = JSON.parse(localStorage.getItem('starterbank_beneficiaries') || '{}');
        if (beneficiaries[userId]) {
            beneficiaries[userId] = beneficiaries[userId].filter(b => b.id !== beneficiaryId);
            localStorage.setItem('starterbank_beneficiaries', JSON.stringify(beneficiaries));
        }
    },

    getTransactions(userId) {
        const transactions = JSON.parse(localStorage.getItem('starterbank_transactions') || '{}');
        return transactions[userId] || [];
    },

    addTransaction(userId, transaction) {
        const transactions = JSON.parse(localStorage.getItem('starterbank_transactions') || '{}');
        if (!transactions[userId]) {
            transactions[userId] = [];
        }
        transactions[userId].unshift(transaction);
        localStorage.setItem('starterbank_transactions', JSON.stringify(transactions));
    }
};

// Initialize on load
StorageManager.init();