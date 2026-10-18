import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Check } from 'lucide-react'

export default function InAppNotification({ onShowChangelog }) {
    const [visible, setVisible] = useState(false)
    const [version, setVersion] = useState('')
    const [tag, setTag] = useState('')
    const [date, setDate] = useState('')


    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) return

        fetch('/version.json?t=' + Date.now())
            .then(r => r.json())
            .then(data => {
                const seen = localStorage.getItem('artha_seen_version')
                if (seen !== data.version) {
                    setVersion(data.version)
                    setTag(data.tag || '')
                    setTimeout(()=>setVisible(true), 1000)
                    setDate(data.date || '')
                }
            })
            .catch(() => {})
    }, [])

    const dismiss = () => {
        localStorage.setItem('artha_seen_version', version)
        setVisible(false)
    }

    useEffect(() => {
        if (!visible) return
        const t = setTimeout(() => dismiss(), 18000)
        return () => clearTimeout(t)
    }, [visible])

    const handleWhatsNew = () => {
        localStorage.setItem('artha_seen_version', version)
        setVisible(false)
        onShowChangelog?.()
    }

    return (
        <AnimatePresence>
            {visible && (
                <>
                    {/* Vignette */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '100vh',
                            background: 'linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 60%, transparent 100%)',
                            pointerEvents: 'none',
                            zIndex: 9998,
                        }}
                    />

                    {/* Pill */}
                    <motion.div
                        initial={{
                            opacity: 1,
                            width: '120px',
                            height: '56px',
                            borderRadius: '999px',
                        }}
                        animate={{
                            opacity: 1,
                            width: 'calc(100vw - 24px)',
                            height: '28vh',
                            borderRadius: '22px',
                        }}
                        exit={{
                            opacity: 0,
                            width: '120px',
                            height: '56px',
                            borderRadius: '999px',
                        }}
                        transition={{
                            width:    { type: 'spring', stiffness: 380, damping: 28 },
                            height:   { type: 'spring', stiffness: 320, damping: 28, delay: 0.06 },
                            borderRadius: { type: 'spring', stiffness: 380, damping: 28 },
                            opacity:  { duration: 0.12 },
                        }}
                        style={{
                            position: 'fixed',
                            top: '12px',
                            left: '50%',
                            x: '-50%',
                            maxWidth: '500px',
                            transformOrigin: 'top center',
                            background: '#0a0a0a',
                            border: '1px solid rgba(255,255,255,0.12)',
                            boxShadow: '0 8px 40px rgba(0,0,0,0.8)',
                            overflow: 'hidden',
                            zIndex: 9999,
                        }}
                    >
                        {/* Content */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ delay: 0.22, duration: 0.2 }}
                            style={{ padding: '18px 20px' }}
                            className="flex flex-col justify-between h-full"
                        >
                            {/* Top — icon + title + version */}
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center w-full justify-between ">
                                    
                                    <p
                                    style={{ fontFamily: 'EB Garamond, serif' }}  className="text-gray-400 text-[21px] ml-2 font-semibold tracking-widest uppercase">
                                        Artha just updated
                                    </p>
                                    <motion.span
                                        className="text-3xl  text-shadow-fuchsia-500 flex-shrink-0"
                                        animate={{ rotate: 360  }}
                                        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                                    >
                                        ✦
                                    </motion.span>
                                </div>
                                <p className="text-zinc-600 text-xs"></p>
                                
                            </div>

                            {/* Middle — tag + date */}
                            <div className="flex flex-col ml-2 ">
                                {tag && (
                                    <motion.p 
                                        initial={{ opacity: 0, x: -2 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3, delay: 0.4}}
                                    style={{ fontFamily: 'EB Garamond, serif' }}  className="text-white flex items-center gap-3 text-[24px] font-medium">"{tag}"</motion.p>
                                )}
                                <p className="text-zinc-500 text-[10px] mt-1 flex-shrink-0">{version} - Updated on {date}</p>
                            </div>

                            {/* Bottom — buttons */}
                            <div className="flex items-center gap-3 mt-3 px-1">
                                <button
                                    onClick={handleWhatsNew}
                                    className="text-sm font-semibold flex-1 py-2.5 rounded-xl text-black bg-gray-500"
                                    style={{ 
                                        background: 'white',
                                        boxShadow: '0 0 12px rgba(255,255,255,0.15)'
                                    }}
                                >
                                    What's new
                                </button>
                                <button
                                    onClick={dismiss}
                                    className="text-sm text-zinc-200 tracking-wide bg-zinc-900 py-2.5 px-5 rounded-xl"
                                >
                                    Ignore
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}