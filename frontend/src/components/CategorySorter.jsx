import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion"
import api from "../api/axios"

export default function CategorySorter({ onComplete }){
    const [transactions, setTransactions] = useState([]);
    const [current, setCurrent] = useState(0);
    const [leaving, setLeaving] = useState(false);
    const [customCategory, setCustomCategory] = useState("");
    const [categories, setCategories] = useState([]);
    const [currentCategory, setCurrentCategory] = useState("");

    useEffect(()=>{
        api.get("/transactions/uncategorized").then(res => {
            setTransactions(res.data);
        });
    }, []);

    //this below was done by ai
    useEffect(()=>{
        if(transactions.length === 0) return;
        const tx = transactions[current];
        if(!tx) return;
        const catType = tx.type === 'credit' ? 'income' : 'expense';
        api.get(`/categories?type=${catType}`).then(res => {
            setCategories(res.data.map(c => c.name));
        });
    }, [transactions, current]);

    const handleSelect = async (category) => {
        if (leaving) return
        setLeaving(true)

        const tx = transactions[current]

        // If new category — save to DB first, then continue
        if (!categories.includes(category)) {
            const catType = tx.type === 'credit' ? 'income' : 'expense'
            try {
                await api.post('/categories', { name: category, type: catType })
            } catch (err) {
                // Ignore duplicate error — category might already exist
                console.error(err)
            }
        }

        // Update transaction category
        await api.patch(`/transactions/${tx._id}/category`, { category })

        setCustomCategory('')

        const next = current + 1
        if (next >= transactions.length) {
            onComplete?.()
            return
        }

        // Fetch fresh categories for next transaction
        const nextTx = transactions[next]
        const nextCatType = nextTx.type === 'credit' ? 'income' : 'expense'
        const res = await api.get(`/categories?type=${nextCatType}`)
        setCategories(res.data.map(c => c.name))

        setCurrent(next)
        setLeaving(false)
    }

    if (transactions.length === 0 && current === 0) return (
        <div className="fixed inset-0 z-50 flex flex-col justify-end" style={{ background: "rgba(0,0,0,0.7)" }}>
            <div className="rounded-t-3xl p-6 pb-10 text-center text-zinc-500 text-sm" style={{ background: "#111" }}>
                Loading...
            </div>
        </div>
    );

    if (current >= transactions.length && transactions.length > 0) return null;

    const tx = transactions[current];
    const remaining = transactions.length - current;

    return(
        <div className="fixed inset-0 z-50 flex flex-col justify-center m-5" style={{ background: "rgba(0,0,0,0.7)" }}>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="rounded-3xl p-6 pb-10 overflow-y-scroll max-h-[99vh]"
                style={{ background: "#111" }}
            >
                <div className="flex justify-between items-center mb-6">
                    <p className="text-white font-semibold text-base">Sort Transactions</p>
                    <div className="flex items-center gap-3">
                        <p className="text-zinc-500 text-xs">{remaining} left</p>
                        <button onClick={onComplete} className="text-white flex justify-center items-center cursor-pointer transition-all 0.3s active:scale-110 bg-zinc-900 w-8 h-8 rounded-4xl text-xs">✕</button>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={tx._id}
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -40 }}
                        transition={{ duration: 0.15, delay: 0.2 }}
                        className="bg-zinc-900 rounded-xl p-3 mb-4 flex gap-4"
                    >
                        <div>
                            <span className="w-2 rounded-2xl inline-block h-full" style={{
                                backgroundColor: tx.type === 'credit' ? '#10b981' : '#ef4444'}} />
                        </div>
                        <div>
                            <p className="text-white font-medium text-lg">{tx.description}</p>
                            <p className="text-zinc-400 text-sm mt-1">₹{tx.amount.toLocaleString("en-IN")}</p>
                        </div>
                    </motion.div>
                </AnimatePresence>

                <motion.p
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.25, delay: 0.2 }}
                    className="text-zinc-500 text-xs mb-2"
                >
                    Add a custom one:
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.25, delay: 0.3 }}
                    className="flex gap-2 mb-4"
                >
                    <input
                        type="text"
                        value={customCategory}
                        onChange={e => setCustomCategory(e.target.value)}
                        placeholder="Custom category..."
                        className="flex-1 bg-zinc-800 text-white text-xs rounded-full px-4 py-2 outline-none placeholder:text-zinc-600"
                    />
                    <button
                        onClick={() => {
                            if(customCategory.trim()) handleSelect(customCategory.trim())
                        }}
                        className="px-4 py-2 rounded-full text-xs font-medium bg-amber-700 text-white"
                    >
                        Add
                    </button>
                </motion.div>

                <p className="text-zinc-500 text-xs mb-2">Or choose from existing categories:</p>
                <motion.div
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.25, delay: 0.4 }}
                    className="flex flex-wrap gap-2 max-h-80 overflow-y-auto"
                >
                    {categories.map((cat, index) => (
                        <button
                            key={index}
                            onClick={() => handleSelect(cat)}
                            className="px-3 py-1.5 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300 hover:bg-indigo-600 hover:text-white transition-all"
                        >
                            {cat}
                        </button>
                    ))}
                </motion.div>
            </motion.div>
        </div>
    );
}