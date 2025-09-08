"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import './dashboard.css';

const DashboardPage = () => {
    const [friends, setFriends] = useState<string[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [friendName, setFriendName] = useState('');
    const [transactionData, setTransactionData] = useState({
        type: 'expense',
        friend: '',
        amount: '',
        reason: '',
    });
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true); // To handle initial auth check

    // Auth Guard Effect
    useEffect(() => {
        const token = localStorage.getItem('hisab_token');
        if (!token) {
            router.push('/login');
        } else {
            setIsLoading(false);
        }
    }, [router]);

    useEffect(() => {
        if (isLoading) return; // Don't fetch data until auth check is complete

        const fetchData = async () => {
            try {
                const [friendsRes, transactionsRes] = await Promise.all([
                    api.get('/friends'),
                    api.get('/transactions'),
                ]);
                setFriends(friendsRes.data);
                setTransactions(transactionsRes.data);
            } catch (error: any) {
                if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                    logout();
                }
                console.error('Failed to fetch initial data:', error);
            }
        };

        fetchData();
    }, [isLoading]);

    const logout = () => {
        localStorage.removeItem('hisab_token');
        router.push('/login');
    };

    const addFriend = async () => {
        if (!friendName.trim()) {
            toast.error("Please enter a friend's name");
            return;
        }
        const promise = api.post('/friends', { name: friendName });
        toast.promise(promise, {
            loading: 'Adding friend...',
            success: () => {
                setFriends([...friends, friendName]);
                setFriendName('');
                return 'Friend added successfully!';
            },
            error: (err) => err.response?.data?.error || 'Failed to add friend',
        });
    };

    const removeFriend = async (name: string) => {
        const promise = api.delete(`/friends/${name}`).then(() => {
            // Refetch data after successful deletion
            return Promise.all([
                api.get('/friends'),
                api.get('/transactions'),
            ]);
        });

        toast.promise(promise, {
            loading: 'Removing friend...',
            success: (res) => {
                const [friendsRes, transactionsRes] = res;
                setFriends(friendsRes.data);
                setTransactions(transactionsRes.data);
                return 'Friend removed successfully!';
            },
            error: (err) => err.response?.data?.error || 'Failed to remove friend',
        });
    };

    const handleTransactionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setTransactionData({ ...transactionData, [id]: value });
    };

    const addTransaction = async () => {
        const { friend, amount, reason } = transactionData;
        if (!friend) return toast.error('Please select a friend');
        if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) return toast.error('Please enter a valid amount');
        if (!reason.trim()) return toast.error('Please enter a reason');

        const promise = api.post('/transactions', { ...transactionData, amount: parseFloat(amount) });

        toast.promise(promise, {
            loading: 'Adding transaction...',
            success: () => {
                // Refetch transactions to update the list
                api.get('/transactions').then(res => setTransactions(res.data));
                setTransactionData({ type: 'expense', friend: '', amount: '', reason: '' });
                return 'Transaction added successfully!';
            },
            error: (err) => err.response?.data?.error || 'Failed to add transaction',
        });
    };

    const balances = useMemo(() => {
        const balances: { [key: string]: number } = {};
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

    if (isLoading) {
        return <div>Loading...</div>; // Or a proper spinner component
    }

    return (
        <div className="container">
            <div className="header" style={{ position: 'relative' }}>
                <h1>💰 Hisab Calculator</h1>
                <p>Track expenses and settlements between friends</p>
                <button className="btn" onClick={logout} style={{ position: 'absolute', top: '20px', right: '20px', width: 'auto' }}>Logout</button>
            </div>

            <div className="dashboard-content">
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
                            <h3>{netBalance > 0 ? "Net: You'll Receive" : netBalance < 0 ? "Net: You'll Pay" : 'Net: All Settled'}</h3>
                            <div className="balance-amount" style={{ color: netBalance > 0 ? '#28a745' : netBalance < 0 ? '#dc3545' : 'white' }}>
                                ₹{Math.abs(netBalance).toFixed(2)}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="main-grid">
                    <div className="section">
                        <h2>💸 Add Transaction</h2>
                        <div className="form-group">
                            <label htmlFor="type">Transaction Type</label>
                            <select id="type" value={transactionData.type} onChange={handleTransactionChange}>
                                <option value="expense">I paid for friend</option>
                                <option value="income">Friend paid for me</option>
                                <option value="settlement">Settlement</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="friend">Friend</label>
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
                            <textarea id="reason" rows={3} placeholder="What was this transaction for?" value={transactionData.reason} onChange={handleTransactionChange}></textarea>
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
                        <h2>⚖️ Balance Summary</h2>
                        <div id="balanceSummary" className="transaction-list">
                            {friends.length > 0 ? Object.entries(balances).map(([friend, balance]) => {
                                let balanceText, balanceClass, barClass;
                                if (balance > 0) {
                                    balanceText = `Owes you ₹${balance.toFixed(2)}`;
                                    balanceClass = 'amount-positive';
                                    barClass = 'balance-bar-positive';
                                } else if (balance < 0) {
                                    balanceText = `You owe ₹${Math.abs(balance).toFixed(2)}`;
                                    balanceClass = 'amount-negative';
                                    barClass = 'balance-bar-negative';
                                } else {
                                    balanceText = `Settled up`;
                                    balanceClass = 'amount-neutral';
                                    barClass = 'balance-bar-neutral';
                                }
                                // Simple visualization: bar width based on a fixed scale or relative to max balance
                                const maxAbsBalance = Math.max(...Object.values(balances).map(b => Math.abs(b)), 100);
                                const barWidth = `${(Math.abs(balance) / maxAbsBalance) * 100}%`;

                                return (
                                    <div key={friend} className="balance-item">
                                        <div className="balance-info">
                                            <strong>{friend}</strong>
                                            <span className={balanceClass}>{balanceText}</span>
                                        </div>
                                        <div className="balance-bar-container">
                                            <div className={`balance-bar ${barClass}`} style={{ width: barWidth }}></div>
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
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;

