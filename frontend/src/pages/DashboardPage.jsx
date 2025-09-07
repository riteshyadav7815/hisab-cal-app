import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const DashboardPage = () => {
    const [friends, setFriends] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [friendName, setFriendName] = useState('');
    const [transactionData, setTransactionData] = useState({
        type: 'expense',
        friend: '',
        amount: '',
        reason: '',
    });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [friendsRes, transactionsRes] = await Promise.all([
                    api.get('/friends'),
                    api.get('/transactions'),
                ]);
                setFriends(friendsRes.data);
                setTransactions(transactionsRes.data);
            } catch (error) {
                if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                    logout();
                }
                console.error('Failed to fetch initial data:', error);
            }
        };

        fetchData();
    }, []);

    const logout = () => {
        localStorage.removeItem('hisab_token');
        navigate('/login');
    };

    const addFriend = async () => {
        if (!friendName.trim()) {
            alert('Please enter a friend\'s name');
            return;
        }
        try {
            await api.post('/friends', { name: friendName });
            setFriends([...friends, friendName]);
            setFriendName('');
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to add friend');
        }
    };

    const removeFriend = async (name) => {
        if (window.confirm(`Are you sure you want to remove ${name}? This will also remove all transactions with this friend.`)) {
            try {
                await api.delete(`/friends/${name}`);
                const [friendsRes, transactionsRes] = await Promise.all([
                    api.get('/friends'),
                    api.get('/transactions'),
                ]);
                setFriends(friendsRes.data);
                setTransactions(transactionsRes.data);
            } catch (error) {
                alert(error.response?.data?.error || 'Failed to remove friend');
            }
        }
    };

    const handleTransactionChange = (e) => {
        const { id, value } = e.target;
        setTransactionData({ ...transactionData, [id]: value });
    };

    const addTransaction = async () => {
        const { type, friend, amount, reason } = transactionData;
        if (!friend) return alert('Please select a friend');
        if (isNaN(amount) || amount <= 0) return alert('Please enter a valid amount');
        if (!reason.trim()) return alert('Please enter a reason');

        try {
            await api.post('/transactions', { ...transactionData, amount: parseFloat(amount) });
            const transactionsRes = await api.get('/transactions');
            setTransactions(transactionsRes.data);
            setTransactionData({ type: 'expense', friend: '', amount: '', reason: '' });
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to add transaction');
        }
    };

    const balances = useMemo(() => {
        const balances = {};
        friends.forEach(friend => { balances[friend] = 0; });
        transactions.forEach(t => {
            if (t.type === 'expense') balances[t.friend] += t.amount;
            else if (t.type === 'income') balances[t.friend] -= t.amount;
            else if (t.type === 'settlement') balances[t.friend] -= t.amount;
        });
        return balances;
    }, [friends, transactions]);

    const { totalOwed, totalOwing, netBalance } = useMemo(() => {
        let totalOwed = 0;
        let totalOwing = 0;
        Object.values(balances).forEach(balance => {
            if (balance > 0) totalOwing += balance;
            else if (balance < 0) totalOwed += Math.abs(balance);
        });
        return { totalOwed, totalOwing, netBalance: totalOwing - totalOwed };
    }, [balances]);

    return (
        <div className="container">
            <div className="header" style={{ position: 'relative' }}>
                <h1>💰 Hisab Calculator</h1>
                <p>Track expenses and settlements between friends</p>
                <button className="btn" onClick={logout} style={{ position: 'absolute', top: '20px', right: '20px', width: 'auto' }}>Logout</button>
            </div>

            <div className="main-content">
                <div className="section">
                    <h2>👥 Manage Friends</h2>
                    <div className="form-group">
                        <label htmlFor="friendName">Friend's Name</label>
                        <input type="text" id="friendName" placeholder="Enter friend's name" value={friendName} onChange={(e) => setFriendName(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && addFriend()} />
                    </div>
                    <button className="btn" onClick={addFriend}>Add Friend</button>
                    <div className="friends-list">
                        {friends.length > 0 ? friends.map(f => (
                            <div key={f} className="friend-tag">
                                {f}
                                <button className="remove-friend" onClick={() => removeFriend(f)} title="Remove friend">×</button>
                            </div>
                        )) : <p style={{ color: '#999', textAlign: 'center', marginTop: '20px' }}>No friends added yet</p>}
                    </div>
                </div>

                <div className="section">
                    <h2>💸 Add Transaction</h2>
                    <div className="form-group">
                        <label htmlFor="transactionType">Transaction Type</label>
                        <select id="type" value={transactionData.type} onChange={handleTransactionChange}>
                            <option value="expense">I paid for friend</option>
                            <option value="income">Friend paid for me</option>
                            <option value="settlement">Settlement</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="friendSelect">Friend</label>
                        <select id="friend" value={transactionData.friend} onChange={handleTransactionChange}>
                            <option value="">Select a friend</option>
                            {friends.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="amount">Amount (₹)</label>
                        <input type="number" id="amount" placeholder="0.00" step="0.01" value={transactionData.amount} onChange={handleTransactionChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="reason">Reason/Description</label>
                        <textarea id="reason" rows="3" placeholder="What was this transaction for?" value={transactionData.reason} onChange={handleTransactionChange}></textarea>
                    </div>
                    <button className="btn" onClick={addTransaction}>Add Transaction</button>
                </div>

                <div className="section">
                    <h2>📋 Recent Transactions</h2>
                    <div className="transaction-list">
                        {transactions.length > 0 ? transactions.slice(0, 10).map(t => {
                            let amountClass = t.type === 'expense' ? 'amount-negative' : 'amount-positive';
                            let prefix = t.type === 'expense' ? 'You paid ' : t.type === 'income' ? 'You received ' : 'Settlement ';
                            return (
                                <div key={t.id} className="transaction-item">
                                    <div className="transaction-header">
                                        <strong>{t.friend}</strong>
                                        <span className={`transaction-amount ${amountClass}`}>{`${prefix}₹${t.amount.toFixed(2)}`}</span>
                                    </div>
                                    <div className="transaction-details">
                                        <div>{t.reason}</div>
                                        <small>{new Date(t.date).toLocaleString()}</small>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="empty-state">
                                <div>📝</div>
                                <p>No transactions yet. Add your first transaction above!</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="section">
                    <h2>⚖️ Balance Summary</h2>
                    <div id="balanceSummary">
                        {friends.length > 0 ? Object.entries(balances).map(([friend, balance]) => {
                            let balanceText, balanceClass;
                            if (balance > 0) {
                                balanceText = `${friend} owes you ₹${balance.toFixed(2)}`;
                                balanceClass = 'amount-positive';
                            } else if (balance < 0) {
                                balanceText = `You owe ${friend} ₹${Math.abs(balance).toFixed(2)}`;
                                balanceClass = 'amount-negative';
                            } else {
                                balanceText = `Settled with ${friend}`;
                                balanceClass = '';
                            }
                            return (
                                <div key={friend} className="transaction-item">
                                    <div className="transaction-header">
                                        <strong>{friend}</strong>
                                        <span className={`transaction-amount ${balanceClass}`}>{balanceText}</span>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="empty-state">
                                <div>💰</div>
                                <p>Add friends and transactions to see balance summary</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="balance-summary">
                    <h2>📊 Overall Summary</h2>
                    <div className="balance-grid">
                        <div className="balance-card">
                            <h3>Total You Owe</h3>
                            <div className="balance-amount">₹{totalOwed.toFixed(2)}</div>
                        </div>
                        <div className="balance-card">
                            <h3>Total Owed to You</h3>
                            <div className="balance-amount">₹{totalOwing.toFixed(2)}</div>
                        </div>
                        <div className="balance-card">
                            <h3>{netBalance > 0 ? 'Net: You\'ll Receive' : netBalance < 0 ? 'Net: You\'ll Pay' : 'Net: All Settled'}</h3>
                            <div className="balance-amount" style={{ color: netBalance > 0 ? '#28a745' : netBalance < 0 ? '#dc3545' : 'white' }}>
                                ₹{Math.abs(netBalance).toFixed(2)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
