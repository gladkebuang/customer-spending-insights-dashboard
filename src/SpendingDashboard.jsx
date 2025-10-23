import React, { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { ChevronDown, TrendingUp, TrendingDown, Clock, Tag, CreditCard, ShoppingBag, Utensils, Zap, Car, Film, ShoppingCart, DollarSign, Users, Calendar } from 'lucide-react'; // Using lucide-react for icons

// Mock API Call functions using the provided endpoint structures
const MOCK_CUSTOMER_ID = "12345";
const API_DELAY = 300; // Simulate network latency

// --- 1. INTERFACES & MOCK DATA ---

const mockProfile = {
  customerId: MOCK_CUSTOMER_ID,
  name: "John Doe",
  email: "john.doe@email.com",
  joinDate: "2023-01-15",
  accountType: "premium",
  totalSpent: 15420.50,
  currency: "ZAR"
};

const mockSummary = (period) => ({
  period: period,
  totalSpent: 4250.75,
  transactionCount: 47,
  averageTransaction: 90.44,
  topCategory: "Groceries",
  comparedToPrevious: {
    spentChange: 12.5, // 12.5% increase
    transactionChange: -3.2 // 3.2% decrease
  }
});

const mockCategories = {
  dateRange: { startDate: "2024-08-16", endDate: "2024-09-16" },
  totalAmount: 4250.75,
  categories: [
    { name: "Groceries", amount: 1250.30, percentage: 29.4, transactionCount: 15, color: "#FF6B6B", icon: ShoppingCart },
    { name: "Entertainment", amount: 890.20, percentage: 20.9, transactionCount: 8, color: "#4ECDC4", icon: Film },
    { name: "Transportation", amount: 680.45, percentage: 16.0, transactionCount: 12, color: "#45B7D1", icon: Car },
    { name: "Dining", amount: 520.30, percentage: 12.2, transactionCount: 9, color: "#F7DC6F", icon: Utensils },
    { name: "Shopping", amount: 450.80, percentage: 10.6, transactionCount: 6, color: "#BB8FCE", icon: ShoppingBag },
    { name: "Utilities", amount: 458.70, percentage: 10.8, transactionCount: 3, color: "#85C1E9", icon: Zap }
  ]
};

const mockTrends = {
  trends: [
    { month: "Jan 24", totalSpent: 3890.25, transactionCount: 42, averageTransaction: 92.62 },
    { month: "Feb 24", totalSpent: 4150.80, transactionCount: 38, averageTransaction: 109.23 },
    { month: "Mar 24", totalSpent: 3750.60, transactionCount: 45, averageTransaction: 83.35 },
    { month: "Apr 24", totalSpent: 4200.45, transactionCount: 39, averageTransaction: 107.70 },
    { month: "May 24", totalSpent: 3980.30, transactionCount: 44, averageTransaction: 90.46 },
    { month: "Jun 24", totalSpent: 4250.75, transactionCount: 47, averageTransaction: 90.44 },
  ]
};

const mockGoals = {
    goals: [
      { id: "goal_001", category: "Entertainment", monthlyBudget: 1000.00, currentSpent: 650.30, percentageUsed: 65.03, daysRemaining: 12, status: "on_track" },
      { id: "goal_002", category: "Groceries", monthlyBudget: 1500.00, currentSpent: 1450.80, percentageUsed: 96.72, daysRemaining: 12, status: "warning" }
    ]
};

const mockTransactions = {
  transactions: [
    { id: "txn_123456", date: "2024-09-16T14:30:00Z", merchant: "Pick n Pay", category: "Groceries", amount: 245.80, description: "Weekly groceries", paymentMethod: "Credit Card", icon: ShoppingCart, categoryColor: "#FF6B6B" },
    { id: "txn_123457", date: "2024-09-15T10:15:00Z", merchant: "Netflix", category: "Entertainment", amount: 199.00, description: "Monthly subscription", paymentMethod: "Debit Order", icon: Film, categoryColor: "#4ECDC4" },
    { id: "txn_123458", date: "2024-09-15T08:00:00Z", merchant: "Shell Garage", category: "Transportation", amount: 550.00, description: "Fuel refill", paymentMethod: "Debit Card", icon: Car, categoryColor: "#45B7D1" },
    { id: "txn_123459", date: "2024-09-14T19:45:00Z", merchant: "The Fat Cow Eatery", category: "Dining", amount: 320.50, description: "Dinner out", paymentMethod: "Credit Card", icon: Utensils, categoryColor: "#F7DC6F" },
    { id: "txn_123460", date: "2024-09-13T16:00:00Z", merchant: "Amazon SA", category: "Shopping", amount: 450.80, description: "New charger", paymentMethod: "Credit Card", icon: ShoppingBag, categoryColor: "#BB8FCE" },
  ],
  pagination: { total: 1250, limit: 5, offset: 0, hasMore: true }
};


// --- 2. UTILITY FUNCTIONS ---

const formatCurrency = (amount, currency = 'ZAR') => {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

const formatChange = (change) => {
    const isPositive = change > 0;
    const color = isPositive ? 'text-green-500' : 'text-red-500';
    const Icon = isPositive ? TrendingUp : TrendingDown;
    const sign = isPositive ? '+' : '';

    return (
        <span className={`flex items-center text-sm font-medium ${color}`}>
            <Icon className="w-4 h-4 mr-1" />
            {sign}{Math.abs(change).toFixed(1)}%
        </span>
    );
};

const getCategoryIcon = (iconName) => {
    switch(iconName) {
        case 'shopping-cart': return ShoppingCart;
        case 'film': return Film;
        case 'car': return Car;
        case 'utensils': return Utensils;
        case 'shopping-bag': return ShoppingBag;
        case 'zap': return Zap;
        default: return Tag;
    }
};

const periodOptions = [
    { label: "Last 7 days", value: "7d" },
    { label: "Last 30 days", value: "30d" },
    { label: "Last 90 days", value: "90d" },
    { label: "Last year", value: "1y" },
];


// --- 3. COMPONENTS ---

// Card for Key Metrics
const MetricCard = ({ title, value, unit, comparison, icon: Icon }) => (
    <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-100 transition duration-300 hover:shadow-xl">
        <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">{title}</h3>
            <Icon className="w-5 h-5 text-blue-500" />
        </div>
        <div className="mt-1">
            <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        {comparison && <div className="mt-2">{comparison} vs. previous period</div>}
    </div>
);

// Custom Tooltip for Recharts PieChart
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-3 bg-white border border-gray-300 rounded-lg shadow-md text-sm">
        <p className="font-bold text-gray-800">{data.name}</p>
        <p className="text-gray-600">Spent: {formatCurrency(data.amount, mockProfile.currency)}</p>
        <p className="text-gray-600">Percentage: {data.percentage.toFixed(1)}%</p>
      </div>
    );
  }
  return null;
};

// Spending Goals Component
const SpendingGoals = ({ goals, currency }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 col-span-1 lg:col-span-2">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Spending Goals (Monthly)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map(goal => (
                <div key={goal.id} className={`p-4 rounded-lg border ${goal.status === 'warning' ? 'bg-yellow-50 border-yellow-300' : 'bg-green-50 border-green-300'}`}>
                    <div className="flex justify-between items-center">
                        <p className="font-bold text-gray-800">{goal.category}</p>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${goal.status === 'warning' ? 'bg-yellow-500 text-white' : 'bg-green-500 text-white'}`}>
                            {goal.status.replace('_', ' ')}
                        </span>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                        <p>Budget: {formatCurrency(goal.monthlyBudget, currency)}</p>
                        <p>Spent: {formatCurrency(goal.currentSpent, currency)}</p>
                    </div>
                    <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                                className={`h-2.5 rounded-full ${goal.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'}`} 
                                style={{ width: `${goal.percentageUsed > 100 ? 100 : goal.percentageUsed}%` }}
                            ></div>
                        </div>
                        <p className="text-xs text-right mt-1 font-medium">{goal.percentageUsed.toFixed(1)}% Used</p>
                    </div>
                </div>
            ))}
        </div>
    </div>
);


// --- 4. MAIN APP COMPONENT ---

const App = () => {
    const [selectedPeriod, setSelectedPeriod] = useState(periodOptions[1].value); // Default to 30d
    const [profile, setProfile] = useState(mockProfile);
    const [summary, setSummary] = useState(null);
    const [categories, setCategories] = useState(null);
    const [trends, setTrends] = useState(null);
    const [goals, setGoals] = useState(null);
    const [transactions, setTransactions] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const customerId = MOCK_CUSTOMER_ID; // Use mock ID

    // Unified Data Fetching Function
    const fetchData = () => {
        setIsLoading(true);
        
        // Simulating concurrent API calls
        Promise.all([
            new Promise(resolve => setTimeout(() => resolve(mockSummary(selectedPeriod)), API_DELAY)),
            new Promise(resolve => setTimeout(() => resolve(mockCategories), API_DELAY)),
            new Promise(resolve => setTimeout(() => resolve(mockTrends), API_DELAY)),
            new Promise(resolve => setTimeout(() => resolve(mockGoals), API_DELAY)),
            new Promise(resolve => setTimeout(() => resolve(mockTransactions), API_DELAY * 1.2)),
        ]).then(([summaryData, categoriesData, trendsData, goalsData, transactionsData]) => {
            setSummary(summaryData);
            setCategories(categoriesData);
            setTrends(trendsData);
            setGoals(goalsData);
            setTransactions(transactionsData);
            setIsLoading(false);
        }).catch(error => {
            console.error("Failed to fetch dashboard data:", error);
            setIsLoading(false);
        });
    };

    useEffect(() => {
        fetchData();
    }, [selectedPeriod]); // Refetch when the period changes

    const currency = profile.currency;
    const totalSpentComparison = summary?.comparedToPrevious?.spentChange ? formatChange(summary.comparedToPrevious.spentChange) : null;
    const transactionCountComparison = summary?.comparedToPrevious?.transactionChange ? formatChange(summary.comparedToPrevious.transactionChange) : null;
    
    // Loading State UI
    if (isLoading || !summary || !categories || !trends || !transactions || !goals) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="flex items-center text-blue-600">
                    <svg className="animate-spin h-8 w-8 mr-3" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-xl font-medium">Loading Spending Insights...</span>
                </div>
            </div>
        );
    }
    
    // --- Dashboard Layout ---
    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
            <header className="max-w-7xl mx-auto mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">
                        {profile.name}'s Spending Dashboard
                    </h1>
                    <p className="text-gray-500 mt-1">Analyzing your financial activity for the selected period.</p>
                </div>

                {/* Period Selector */}
                <div className="relative mt-4 sm:mt-0">
                    <select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        className="appearance-none bg-white border border-gray-300 rounded-xl py-2 pl-3 pr-10 text-base font-medium text-gray-700 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
                    >
                        {periodOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute inset-y-0 right-0 h-full w-5 text-gray-400 mr-3" />
                </div>
            </header>

            <main className="max-w-7xl mx-auto space-y-8">
                
                {/* 1. Key Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <MetricCard 
                        title={`Total Spent (${selectedPeriod})`}
                        value={formatCurrency(summary.totalSpent, currency)}
                        icon={DollarSign}
                        comparison={totalSpentComparison}
                    />
                    <MetricCard 
                        title="Transaction Count"
                        value={summary.transactionCount}
                        icon={Calendar}
                        comparison={transactionCountComparison}
                    />
                    <MetricCard 
                        title="Average Transaction"
                        value={formatCurrency(summary.averageTransaction, currency)}
                        icon={CreditCard}
                        comparison={null}
                    />
                    <MetricCard 
                        title="Top Category"
                        value={summary.topCategory}
                        icon={Tag}
                        comparison={null}
                    />
                </div>
                
                {/* 2. Charts (Category Distribution & Monthly Trend) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Pie Chart: Spending by Category */}
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 lg:col-span-1">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Spending Distribution</h2>
                        <div className="h-64 flex flex-col justify-center items-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categories.categories}
                                        dataKey="amount"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        innerRadius={40}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        isAnimationActive={false}
                                    >
                                        {categories.categories.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 space-y-1">
                            {categories.categories.map(cat => {
                                const Icon = getCategoryIcon(cat.icon);
                                return (
                                    <div key={cat.name} className="flex justify-between items-center text-sm">
                                        <div className="flex items-center">
                                            <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: cat.color }}></div>
                                            <Icon className="w-4 h-4 mr-1 text-gray-500" />
                                            <span className="text-gray-700 font-medium">{cat.name}</span>
                                        </div>
                                        <span className="font-semibold text-gray-900">{cat.percentage.toFixed(1)}%</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Bar Chart: Monthly Trends */}
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 lg:col-span-2">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Monthly Spending Trends</h2>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={trends.trends} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="month" stroke="#555" />
                                    <YAxis 
                                        stroke="#555" 
                                        tickFormatter={(value) => formatCurrency(value, currency).replace(currency, '')} 
                                    />
                                    <Tooltip 
                                        formatter={(value) => formatCurrency(value, currency)}
                                        labelFormatter={(label) => `Month: ${label}`}
                                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }}
                                    />
                                    <Bar dataKey="totalSpent" fill="#3B82F6" name="Total Spent" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* 3. Spending Goals */}
                <SpendingGoals goals={goals.goals} currency={currency} />

                {/* 4. Recent Transactions Table */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Transactions</h2>
                    
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Merchant</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Payment Method</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {transactions.transactions.map((txn) => {
                                    const Icon = getCategoryIcon(txn.icon);
                                    return (
                                        <tr key={txn.id} className="hover:bg-gray-50 transition duration-100">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {new Date(txn.date).toLocaleDateString('en-ZA', { month: 'short', day: 'numeric' })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                {txn.merchant}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: `${txn.categoryColor}20`, color: txn.categoryColor }}>
                                                    <Icon className="w-3 h-3 mr-1" />
                                                    {txn.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-right text-red-600">
                                                -{formatCurrency(txn.amount, currency)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                                                {txn.paymentMethod}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {transactions.pagination.hasMore && (
                        <div className="mt-4 text-center">
                             <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                View all {transactions.pagination.total} transactions &rarr;
                            </button>
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
};

export default App;
