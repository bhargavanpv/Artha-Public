import { useEffect, useState } from 'react';
import api from '../api/axios';
import { 
  AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts'
import AddTransaction from '../components/AddTransaction';
import BottomNav from '../components/BottomNav';
import { useData } from '../context/DataContext'

function Charts() { 

    const [scrolled,setScrolled] = useState(false);
    const [showAdd, setShowAdd] = useState(false);
    const [timeRange, setTimeRange] = useState('1W'); // 'monthly' or 'yearly' 

    const { transactions, stats, user, refreshData } = useData()

   //handle scroll
    useEffect(()=>{
        const handleScroll = () => {
            setScrolled(window.scrollY > 10)
        }
        window.addEventListener("scroll", handleScroll)
        return() => window.removeEventListener('scroll',handleScroll)
    },[])

    //-----------------Effects ends

    const now = new Date();
    const date = now.toLocaleDateString('en-IN', {
        weekday: 'long',
        month: 'long', 
        day: 'numeric' 
    })

    const spent= stats?.['Total Spent This Month'] || 0
    const income = stats?.['Total Income This Month'] || 0
    const balance = income - spent

    const allLineData = stats ? Object.entries(stats.monthlySpendings).map(([month, amount]) => {
    const [year, m] = month.split('-');
        const label = new Date(year, parseInt(m) - 1).toLocaleString('default', { month: 'short', year: 'numeric' });
        return { month: label, spent: amount };
    }) : []

    const getLineData = () => {
        if (timeRange === '6M') return allLineData.slice(-6)
        if (timeRange === '3M') return allLineData.slice(-3)

        const days = timeRange === '1M' ? 30 : 7
        const cutoff = new Date()
        cutoff.setDate(cutoff.getDate() - days)

        const grouped = transactions
            .filter(t => t.type === 'debit' && new Date(t.date) >= cutoff)
            .reduce((acc, t) => {
                const dateObj = new Date(t.date)
                const day = dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                if (!acc[day]) acc[day] = { spent: 0, timestamp: dateObj.getTime() }
                acc[day].spent += t.amount
                return acc
            }, {})

        return Object.entries(grouped)
            .map(([day, { spent, timestamp }]) => ({ month: day, spent, timestamp }))
            .sort((a, b) => a.timestamp - b.timestamp)
    }

    const lineData = getLineData()

    const barData = stats ? Object.entries(stats.categoryBreakdown)
    .map(([name, value]) => ({ name, amount: Math.round(value) }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0,5)
    : []

    const incomeBarData = stats ? Object.entries(stats.categoryIncomeBreakdown)
    .map(([name, value]) => ({ name, amount: Math.round(value) }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0,5)
    : []

    const BAR_COLORS = [
        '#ff1a1a',  // intense red — highest spender
        '#e63535',
        '#cc4444',
        '#b05252',
        '#8b5c5c',  // muted red-brown — lowest spender
        ]
    const INCOME_COLORS = [
        '#00ff88',  // intense green — highest
        '#00e676',
        '#00c853',
        '#43a047',
        '#2e7d32',
        ];
    const topMerchants = stats?.topMerchants || []
    
    const isLargeBalance = balance.toLocaleString('en-IN').length > 5

    //the below formats the ugly numbers into indian currency format with 2 decimal (₹xx,xx,xxx format)
    const formatRupees = (value) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(Number(value) || 0);
    };

    return (
        <div className="min-h-screen bg-black text-white pb-28 px-4">

        {/* Sticky Header */}
            <div className={`sticky top-0 z-50 flex justify-between items-center pr-2 py-3 px-1 transition-all duration-300 ${
            scrolled 
                ? 'backdrop-blur-xs bg-zinc-950/80 border-b border-zinc-800/50' 
                : 'bg-transparent border-b border-transparent'
            }`}>
            <div>
                <p style={{fontFamily:"EB Garamond"}} className="text-white font-semibold text-2xl">{user?.name || ""}</p>
                <p  className="text-zinc-500 text-xs mt-0.5">{date}</p>
            </div>
            <p style={{ fontFamily: 'EB Garamond, serif' }} className="text-white font-bold text-4xl tracking-tight">Artha</p>
        </div>

        {/* Balance Card */}
        <div className="rounded-3xl p-6 flex flex-col gap-4 mt-2 mb-3"
        style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}
        >
            <p className="text-zinc-500 text-xs tracking-widest uppercase ">Current Month Net Balance</p>
            
            {/* Main Balance */}
            <div className="flex justify-between items-center mb-3">
                {balance<0?
                    <p className="text-5xl font-bold tracking-tight text-red-500 tracking-tight truncate max-w-[75%]">
                    ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </p>
                    :
                    <p className="text-6xl font-bold tracking-tight text-white">
                    ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </p>
                }

               
            </div>
            {/* text below balance */}
            <div className="text-zinc-600 text-xs border-white/5 flex justify-between">
                <div className="flex gap-2">
                    <span className="text-emerald-400">↑ ₹{income.toLocaleString('en-IN')} in</span>
                    <span>{' · '}</span>
                    <span className="text-red-400">↓ ₹{spent.toLocaleString('en-IN')} out</span>
                </div>
                <span className='text-zinc-700' >{' *this month'}</span>
            </div>
            <span className='text-zinc-600 text-[10px] tracking-widest -my-3'>This only show's current month's Income - Expenses</span>
        </div>

        

            {/* Line Chart Card  */}

            <div data-tour="spending-chart" className='rounded-2xl p-4 mt-4 bg-zinc-950'>

               <div className="flex justify-between items-center mb-4">
                    <h2 className='text-zinc-400 text-xs font-medium tracking-widest uppercase'>
                        {timeRange === '1W' || timeRange === '1M' ? 'Daily Spendings' : 'Monthly Spendings'}
                    </h2>
                    <div className="flex gap- bg-zinc-900 rounded-full px-1 py-1">
                        {['1W', '1M', '3M', '6M'].map(range => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                                    timeRange === range
                                        ? 'bg-white/10 text-white'
                                        : 'text-zinc-600'
                                }`}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                </div>
                {lineData.length === 0 ? 
                    (
                        <p>
                            No data Yet 
                        </p>
                    )
                    : 
                    (
                        <ResponsiveContainer width="100%" height={280}>
                            <AreaChart data={lineData} style={{outline: "none"}}>
                                <defs>
                                    <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="red" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="red" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="month" tick={{ fill: 'gray', fontSize: 10 }} axisLine={false} tickLine={false} />
                                <YAxis
                                    tick={{ fill: 'white', fontSize: 10 }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(value) => formatRupees(value)}
                                />
                                <Tooltip
                                    contentStyle={{ background: '#09090b', border: '1px solid #27272a', borderRadius: 8 }}
                                    labelStyle={{ color: 'white' }}
                                    style={{ outline: 'none' }}
                                    itemStyle={{ color: 'red', fontWeight: 900 }}
                                    formatter={(value) => [formatRupees(value), 'Spent']}
                                    cursor={{ stroke: 'white', strokeWidth: 1, strokeDasharray: '4 4' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="spent"
                                    stroke="red"
                                    strokeWidth={4}
                                    fill="url(#spendGradient)"
                                    style={{ filter: 'drop-shadow(0 0 6px #993300)', outline: 'none'  }}
                                    dot={false}
                                    activeDot={{ r: 5, fill: 'white', strokeWidth: 0 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>  
                        )   

                    }

            </div>

            {/* Spending by category */}
            <div data-tour="category-chart" className="rounded-2xl p-4 mt-4 bg-zinc-950">
                <h2 className='text-zinc-400 text-xs font-medium mb-4 tracking-widest uppercase'>
                    Spending by Category
                </h2>

                {barData.length === 0 ? (
                    <p className="text-zinc-600 text-sm text-center py-4">No data yet</p>
                ) : (
                    <ResponsiveContainer width="100%" height={barData.length * 48}>
                        <BarChart data={barData} layout="vertical" barCategoryGap="20%">
                            <XAxis
                                type="number"
                                tick={{ fill: '#52525b', fontSize: 9 }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`}
                            />
                            <YAxis
                                type="category"
                                dataKey="name"
                                tick={{ fill: '#a1a1aa', fontSize: 11 }}
                                axisLine={false}
                                tickLine={false}
                                width={130}
                            />
                            <Tooltip
                                contentStyle={{ background: '#09090b', border: '1px solid #27272a', borderRadius: 8 }}
                                labelStyle={{ color: '#a1a1aa' }}
                                itemStyle={{ color: 'white' }}
                                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                                formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Spent']}
                            />
                            <Bar dataKey="amount" radius={[0, 8, 8, 0]}>
                                {barData.map((_, index) => (
                                    <Cell
                                        key={index}
                                        fill={BAR_COLORS[index % BAR_COLORS.length]}
                                        style={{ filter: `drop-shadow(0 0 4px ${BAR_COLORS[index % BAR_COLORS.length]})` }}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>

             <div className="rounded-2xl p-4 mt-4 bg-zinc-950">
                <h2 className='text-zinc-400 text-sm text-center mb-4 tracking-widest uppercase'>
                    Top Income Categories
                </h2>

                {incomeBarData.length === 0 ?
                
                (
                    <p>No Data Yet</p>
                )
                
                :
                (
                    <ResponsiveContainer width="100%" height={200} >
                        <BarChart data ={incomeBarData} barCategoryGap="40%">
                            <XAxis
                                dataKey="name"
                                tick={{fill:"#52525b", fontSize:12}}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tick = {{fill: "white", fontSize: 10}}
                                axisLine = {false}
                                tickLine = {false}
                            />
                            <Tooltip
                                contentStyle={{ background : "#09090b", border : '1px solid #27272a', borderRadius : 8 }}
                                labelStyle={{color : "#a1a1aa"}}
                                itemStyle={{color : "white"}}
                                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                                style={{outline:"none"}}
                            />
                            <Bar dataKey="amount" radius={[10,10,1,1]}>
                                {incomeBarData.map((_, index) => (
                                    <Cell
                                        key={index}
                                        fill={INCOME_COLORS[index % INCOME_COLORS.length]}
                                        style={{ filter: `drop-shadow(0 0 3px ${INCOME_COLORS[index % INCOME_COLORS.length]})` }}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )
                
                }

            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">

            {/* Income vs Expense this month */}
            <div className="rounded-2xl p-3 flex flex-col justify-start bg-zinc-950">
                <h2 className="text-zinc-400 text-xs font-medium mb-3 tracking-widest uppercase">This Month</h2>
                <ResponsiveContainer width="100%" height={160}>
                    <BarChart
                        data={[{ name: 'Month', income, spent }]}
                        barCategoryGap="20%"
                    >
                        <XAxis dataKey="name" hide />
                        <YAxis tick={{ fill: '#52525b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                        <Tooltip
                            contentStyle={{ background: '#09090b', border: '1px solid #27272a', borderRadius: 8 }}
                            labelStyle={{ color: '#a1a1aa' }}
                            itemStyle={{ color: 'white' }}
                            formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                            cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                        />
                        <Bar dataKey="income" name="Income" radius={[8, 8, 0, 0]} fill="#10b981"
                            style={{ filter: 'drop-shadow(0 0 3px #10b981)' }}
                        />
                        <Bar dataKey="spent" name="Spent" radius={[8, 8, 0, 0]} fill="#ef4444"
                            style={{ filter: 'drop-shadow(0 0 3px #ef4444)' }}
                        />
                    </BarChart>
                </ResponsiveContainer>
                <div className="flex justify-around mt-2">
                    <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 4px #10b981' }} />
                        <p className="text-zinc-500 text-xs">Income</p>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-red-400" style={{ boxShadow: '0 0 4px #ef4444' }} />
                        <p className="text-zinc-500 text-xs">Spent</p>
                    </div>
                </div>
            </div>

            {/* Top Merchants */}
            <div className="rounded-2xl p-3 bg-zinc-950">
                <h2 className="text-zinc-400 text-xs font-medium mb-3 tracking-widest uppercase">Top Merchants</h2>
                {topMerchants.length === 0 ? (
                    <p className="text-zinc-600 text-xs text-center py-8">No data</p>
                ) : (
                    <div className="flex flex-col gap-5">
                        {topMerchants.map((m, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full flex-shrink-0"
                                        style={{
                                            backgroundColor: BAR_COLORS[index % BAR_COLORS.length],
                                            boxShadow: `0 0 4px ${BAR_COLORS[index % BAR_COLORS.length]}`
                                        }}
                                    />
                                    <p className="text-white text-[14px] font-medium uppercase truncate max-w-[70px]">{m.merchant}</p>
                                </div>
                                <p className="text-zinc-400 text-xs">₹{m.total.toLocaleString('en-IN')}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>

        {/* Recent Transactions Card */}
            <div className="rounded-2xl p-4 mt-4 bg-zinc-950">
            <h2 className="text-zinc-400 text-xs font-medium mb-3 tracking-widest uppercase">Recent Transactions</h2>
            
            {transactions.length === 0 ? (
                <p className="text-zinc-600 text-sm text-center py-4">No transactions yet</p>
            ) : (
                <div className="flex flex-col gap-3 bg-white/1 p-4 rounded-2xl py-4">
                {transactions.slice(0, 5).map((t) => (
                    <div key={t._id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3 ">
                            <span className="w-2 h-9 rounded-4xl"
                            style={{
                                backgroundColor: t.type === 'credit' ? '#10b981' : '#ef4444',
                                // boxShadow: t.type === 'credit' ? '0 0 6px #10b981' : '0 0 6px #ef4444'
                            }}
                            />
                            <div style={{width : "90%"}}>
                            <p className="text-white text-sm font-medium">{t.description}</p>
                            <p className="text-zinc-600 text-xs">{t.category}</p>
                            </div>
                        </div>

                        <p className={`text-m font-semibold ${t.type === 'credit' ? 'text-emerald-400' : 'text-red-400'}`}>
                            {t.type === 'credit' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
                        </p>
                    </div>
                ))}
                </div>
            )}
            </div>
        


        <BottomNav onAddClick={() => setShowAdd(true)} />

        <AddTransaction
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        onSuccess={refreshData}
        />
        </div>
    )
}

export default Charts