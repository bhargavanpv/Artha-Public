import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from "framer-motion"
import api from '../api/axios'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import BottomNav from '../components/BottomNav'
import AddTransaction from '../components/AddTransaction'

function timeAgo(date) {
    if (!date) return ''
    const seconds = Math.floor((new Date() - new Date(date)) / 1000)
    if (seconds < 60) return 'just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes} min ago`
    const hours = Math.floor(minutes / 60)
    return `${hours} hr ago`
}

function extractSuggestions(text) {
    const lines = text.split('\n')
    const suggestions = []
    let inSection = false
    for (const line of lines) {
        if (line.includes('You may also ask')) { inSection = true; continue }
        if (inSection && line.trim().startsWith('•')) {
            suggestions.push(line.replace('•', '').trim())
        }
    }
    return suggestions
}

function WordFadeText({ text, onDone }) {
    const words = text.split(' ')
    const [visibleCount, setVisibleCount] = useState(0)

    useEffect(() => {
        setVisibleCount(0)
        let i = 0
        const interval = setInterval(() => {
            i++
            setVisibleCount(i)
            if (i >= words.length) {
                clearInterval(interval)
                onDone?.()
            }
        }, 40)
        return () => clearInterval(interval)
    }, [text])

    return (
        <div className="prose prose-invert prose-sm max-w-none prose-headings:mb-1 prose-headings:mt-3 prose-p:my-0.5 prose-li:my-0 prose-ul:my-1 prose-ol:my-1 [&>*:first-child]:mt-0">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {words.slice(0, visibleCount).join(' ')}
            </ReactMarkdown>
        </div>
    )
}

function ArthaAI() {
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [showAdd, setShowAdd] = useState(false)
    const [userPlan, setUserPlan] = useState({ plan: 'free', dailyMessageCount: 0 })
    const [copiedIndex, setCopiedIndex] = useState(null)
    const [animatingIndex, setAnimatingIndex] = useState(null)
    const [showUpgrade, setShowUpgrade] = useState(false)
    const [scrolled, setScrolled] = useState(false)

    const [messages, setMessages] = useState(() => {
        const saved = localStorage.getItem('artha-ai-messages')
        if (saved) {
            const parsed = JSON.parse(saved)
            return parsed.map(m => ({ ...m, timestamp: new Date(m.timestamp) }))
        }
        return [{ role: 'ai', text: 'Hey! I am Artha AI. Ask me anything about your finances.', timestamp: new Date() }]
    })

    const bottomRef = useRef(null)
    const textareaRef = useRef(null)

    useEffect(() => {
        localStorage.setItem('artha-ai-messages', JSON.stringify(messages))
    }, [messages])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    useEffect(() => {
        api.get('/auth/me').then(res => {
            setUserPlan({
                plan: res.data.plan,
                dailyMessageCount: res.data.dailyMessageCount
            })
        })
    }, [])

    const LIMITS = { free: 2, plus : 10, pro: 25, power: 50 }
    const creditsLeft = LIMITS[userPlan.plan] === undefined
        ? 3
        : Math.max(0, LIMITS[userPlan.plan] - userPlan.dailyMessageCount)

    const handleCopy = (text, index) => {
        navigator.clipboard.writeText(text)
        setCopiedIndex(index)
        setTimeout(() => setCopiedIndex(null), 2000)
    }

    const handleInputChange = (e) => {
        setInput(e.target.value)
        const textarea = e.target
        textarea.style.height = 'auto'
        textarea.style.height = `${Math.min(textarea.scrollHeight, 240)}px`
    }

    const sendMessage = async (overrideMessage) => {
        const userMessage = (overrideMessage || input).trim()
        if (!userMessage || loading) return

        setInput('')
        if (textareaRef.current) textareaRef.current.style.height = 'auto'

        setMessages(prev => [...prev, { role: 'user', text: userMessage, timestamp: new Date() }])
        setLoading(true)
        setUserPlan(prev => ({ ...prev, dailyMessageCount: prev.dailyMessageCount + 1 }))

        if (creditsLeft - 1 <= 0) setShowUpgrade(true)

        try {
            const res = await api.post('/ai/chat', { question: userMessage })
            const answer = res.data.answer.replace(/\n{3,}/g, '\n\n')
            const suggestions = extractSuggestions(answer)
            setMessages(prev => {
                const newMessages = [...prev, { role: 'ai', text: answer, suggestions, timestamp: new Date() }]
                setAnimatingIndex(newMessages.length - 1)
                return newMessages
            })
        } catch (err) {
            const errMsg = err.response?.data?.message || 'Something went wrong.'
            setMessages(prev => [...prev, { role: 'ai', text: errMsg, timestamp: new Date() }])
        } finally {
            setLoading(false)
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    return (
        <div className="min-h-screen bg-black text-white flex flex-col pb-52">

            {/* Header */}
            <div className="sticky top-0 z-50 px-4 py-3 flex justify-between items-center  bg-black/90 border-b border-white/10">
                <div>
                    <p style={{ fontFamily: 'EB Garamond, serif' }} className="text-white font-semibold text-2xl">Artha</p>
                    <p className="text-zinc-500 text-xs">Your personal finance assistant</p>
                </div>
                <div className="flex items-center gap-2">
                    <motion.p
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        style={{ fontFamily: 'EB Garamond, serif' }}
                        className="text-white font-bold text-4xl tracking-tight"
                    >
                        Artha AI
                    </motion.p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 px-4 py-4 flex flex-col gap-4">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>

                        <div className={`rounded-2xl px-4 py-3 text-sm max-w-[85%] leading-relaxed ${
                            msg.role === 'user'
                                ? 'bg-zinc-800 text-white rounded-br-sm'
                                : 'bg-transparent text-zinc-100 rounded-bl-sm'
                        }`}>
                            {msg.role === 'ai'
                                ? (i === animatingIndex
                                    ? <WordFadeText text={msg.text} onDone={() => setAnimatingIndex(null)} />
                                    : <div className="prose prose-invert prose-sm max-w-none prose-headings:mb-1 prose-headings:mt-3 prose-p:my-0.5 prose-li:my-0 prose-ul:my-1 prose-ol:my-1 [&>*:first-child]:mt-0">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                                      </div>
                                  )
                                : msg.text}
                        </div>

                        {/* Timestamp + Copy */}
                        <div className={`flex items-center gap-2 mt-1 px-1 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <p className="text-zinc-600 text-xs">{timeAgo(msg.timestamp)}</p>
                            <button onClick={() => handleCopy(msg.text, i)} className="text-zinc-600 hover:text-zinc-400 transition-colors">
                                {copiedIndex === i ? (
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="20 6 9 17 4 12"/>
                                    </svg>
                                ) : (
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                                    </svg>
                                )}
                            </button>
                        </div>

                        {/* Suggestion chips */}
                        {msg.role === 'ai' && msg.suggestions?.length > 0 && (
                            <div className="flex flex-col gap-2 mt-2 max-w-[85%]">
                                {msg.suggestions.map((s, si) => (
                                    <button
                                        key={si}
                                        onClick={() => sendMessage(s)}
                                        className="text-left text-xs px-3 py-2 rounded-xl border border-white/10 text-zinc-400 hover:border-white/20 hover:text-white transition-all"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ))}

                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-zinc-900 rounded-2xl rounded-bl-sm px-4 py-3">
                            <div className="flex gap-1 items-center">
                                <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </div>
                )}

                <div ref={bottomRef} />
            </div>

            {/* Upgrade Banner */}
            {showUpgrade && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="fixed bottom-36 left-0 right-0 px-4 z-40"
                >
                    <div className="rounded-2xl p-4 flex items-center justify-between" style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <p className="text-zinc-300 text-sm">You've used all your free messages today.</p>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setShowUpgrade(false)} className="text-zinc-600 text-xs">✕</button>
                            <button className="text-xs bg-white text-black px-3 py-1.5 rounded-full font-medium">Upgrade</button>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Input Bar */}
            <motion.div
                initial={{opacity : "0"}}
                animate={{opacity : "1"}}
                transition={{duration : 0.4}}
                className="fixed bottom-30 left-0 right-0 px-4 z-40">
                <div data-tour="ai-input" className="flex flex-col rounded-2xl p-3 gap-2" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask about your finances..."
                        rows={1}
                        className="w-full bg-transparent text-white text-sm placeholder:text-zinc-600 outline-none resize-none px-2 py-1 overflow-y-auto"
                        style={{ maxHeight: '240px' }}
                    />
                    <div className="flex justify-between items-center px-2">
                        <div className="flex flex-row items-center gap-4">
                            <p data-tour="ai-credits" className="text-gray-400 text-xs">{creditsLeft} / {LIMITS[userPlan.plan]} left today</p>
                            <button
                                onClick={() => {
                                    const fresh = [{ role: 'ai', text: 'Hey! I am Artha AI. Ask me anything about your finances.', timestamp: new Date() }]
                                    setMessages(fresh)
                                    localStorage.setItem('artha-ai-messages', JSON.stringify(fresh))
                                }}
                                className="text-xs text-zinc-500 border border-zinc-800 px-3 py-1.5 rounded-full hover:border-zinc-600 transition-all"
                            >
                                New Chat
                            </button>
                        </div>
                        <button
                            onClick={() => sendMessage()}
                            disabled={loading || !input.trim()}
                            className="w-8 h-8 rounded-xl bg-white flex items-center justify-center disabled:opacity-40 transition-opacity"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="black">
                                <path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </motion.div>

            <BottomNav onAddClick={() => setShowAdd(true)} />
            <AddTransaction isOpen={showAdd} onClose={() => setShowAdd(false)} onSuccess={() => {}} />
        </div>
    )
}

export default ArthaAI