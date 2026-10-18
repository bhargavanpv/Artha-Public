import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Eye, EyeOff, Lock } from 'lucide-react'
import api from '../api/axios'

function UploadStatementModal({
    isOpen,
    onClose,
    selectedFile,
    selectedBank,
    bankLabel,
    onSuccess
}) {
    const [format, setFormat] = useState(null)

    const [mapping, setMapping] = useState({
        date: '',
        description: '',
        debit: '',
        credit: ''
    })

    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [fetchingFormat, setFetchingFormat] = useState(false)

    const [status, setStatus] = useState('idle')
    const [errorMsg, setErrorMsg] = useState('')

    const isXLS = selectedFile && [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ].includes(selectedFile.type)

    // Fetch bank format when modal opens
    useEffect(() => {
        if (!isOpen || !selectedBank) return

        const fetchFormat = async () => {
            setFetchingFormat(true)
            setErrorMsg('')

            try {
                const res = await api.get(
                    `/transactions/format/${selectedBank}`
                )

                setFormat(res.data)

                setMapping({
                    date: res.data.fields.date,
                    description: res.data.fields.description,
                    debit: res.data.fields.debit,
                    credit: res.data.fields.credit
                })

            } catch (err) {
                setErrorMsg('Could not load bank format.')
            } finally {
                setFetchingFormat(false)
            }
        }

        fetchFormat()

    }, [isOpen, selectedBank])


    const handleUpload = async () => {
        if (!selectedFile) return

        setStatus('uploading')
        setErrorMsg('')

        const formData = new FormData()

        formData.append('statement', selectedFile)
        formData.append('bank', selectedBank)
        formData.append('mapping', JSON.stringify(mapping))

        if (password) {
            formData.append('password', password)
        }

        try {
            const res = await api.post(
                '/transactions/upload',
                formData
            )

            setStatus('success')

            setTimeout(() => {
                onSuccess(res.data.message)

                onClose()

                setStatus('idle')
                setPassword('')
                setShowPassword(false)

            }, 1500)

        } catch (err) {
            setStatus('error')

            setErrorMsg(
                err.response?.data?.message ||
                'Upload failed. Please try again.'
            )
        }
    }


    const fields = [
        { key: 'date', label: 'Date Column' },
        { key: 'description', label: 'Description Column' },
        { key: 'debit', label: 'Debit Column' },
        { key: 'credit', label: 'Credit Column' },
    ]


    return (
        <AnimatePresence>

            {isOpen && (

                <motion.div
                    className="fixed inset-0 z-50 flex items-end justify-center"

                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >

                    {/* Backdrop */}

                    <div
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={onClose}
                    />


                    {/* Modal */}

                    <motion.div
                        className="relative w-full max-w-md rounded-t-3xl px-6 pt-6 pb-10 z-10"

                        style={{
                            background: '#111111',
                            border: '1px solid rgba(255,255,255,0.06)'
                        }}

                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}

                        transition={{
                            type: 'spring',
                            damping: 25,
                            stiffness: 200
                        }}
                    >

                        {/* Handle */}

                        <div className="w-10 h-1 rounded-full bg-zinc-700 mx-auto mb-6" />


                        {/* Header */}

                        <div className="flex justify-between items-center mb-6">

                            <div>

                                <h2 className="text-white font-semibold text-base">
                                    Confirm Upload
                                </h2>

                                <p className="text-zinc-500 text-xs mt-0.5">
                                    {bankLabel} · {selectedFile?.name}
                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={onClose}
                                className="text-zinc-600 hover:text-white transition-colors"
                            >
                                <X size={18} />
                            </button>

                        </div>


                        {fetchingFormat ? (

                            <div className="flex justify-center py-8">

                                <div className="w-6 h-6 rounded-full border-2 border-zinc-700 border-t-white animate-spin" />

                            </div>

                        ) : (

                            <>

                                {/* Column Mapping */}

                                <div className="mb-5">

                                    <p className="text-zinc-400 text-xs font-medium tracking-widest uppercase mb-3">
                                        Column Headers
                                    </p>


                                    <p className="text-zinc-600 text-xs mb-4">

                                        These are the column names Artha expects
                                        in your {bankLabel} statement.

                                        Edit if your statement uses different names.

                                    </p>


                                    <div className="flex flex-col gap-3">

                                        {fields.map(({ key, label }) => (

                                            <div
                                                key={key}
                                                className="flex items-center justify-between gap-4"
                                            >

                                                <label
                                                    htmlFor={`mapping-${key}`}
                                                    className="text-zinc-500 text-xs w-28 flex-shrink-0"
                                                >
                                                    {label}
                                                </label>


                                                <input
                                                    id={`mapping-${key}`}
                                                    name={key}

                                                    type="text"

                                                    value={mapping[key]}

                                                    onChange={(e) =>
                                                        setMapping(prev => ({
                                                            ...prev,
                                                            [key]: e.target.value
                                                        }))
                                                    }

                                                    className="flex-1 bg-zinc-900 text-white text-xs rounded-xl px-3 py-2 outline-none border border-zinc-800 focus:border-zinc-600 transition-colors"
                                                />

                                            </div>

                                        ))}

                                    </div>

                                </div>


                                {/* Password Field */}

                                {isXLS && (

                                    <div className="mb-5">

                                        <p className="text-zinc-400 text-xs font-medium tracking-widest uppercase mb-3">
                                            Statement Password
                                        </p>


                                        <div className="relative">

                                            <input
                                                id="statement-password"
                                                name="statement-password"

                                                type={
                                                    showPassword
                                                        ? 'text'
                                                        : 'password'
                                                }

                                                placeholder="Enter password (if protected)"

                                                value={password}

                                                onChange={(e) =>
                                                    setPassword(e.target.value)
                                                }

                                                className="w-full bg-zinc-900 text-white text-xs rounded-xl px-3 py-2.5 outline-none border border-zinc-800 focus:border-zinc-600 transition-colors pr-9"
                                            />


                                            <button
                                                type="button"

                                                onClick={() =>
                                                    setShowPassword(p => !p)
                                                }

                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600"
                                            >

                                                {showPassword
                                                    ? <EyeOff size={14} />
                                                    : <Eye size={14} />
                                                }

                                            </button>

                                        </div>


                                        {/* Privacy Notice */}

                                        <div
                                            className="mt-3 rounded-xl px-3 py-2.5"

                                            style={{
                                                background: 'rgba(255,255,255,0.03)',
                                                border: '1px solid rgba(255,255,255,0.06)'
                                            }}
                                        >

                                            <div className="flex gap-2">

                                                <Lock
                                                    size={14}
                                                    className="text-zinc-500 shrink-0 mt-0.5"
                                                />


                                                <p className="text-zinc-600 text-xs leading-relaxed">

                                                    Your password is used only to
                                                    open this file and is never
                                                    stored. Your statement is
                                                    processed in memory and
                                                    deleted immediately after
                                                    extraction. Only transaction
                                                    data is saved — nothing else.

                                                </p>

                                            </div>

                                        </div>

                                    </div>

                                )}


                                {/* Error */}

                                {errorMsg && (

                                    <div
                                        className="mb-4 rounded-xl px-3 py-2.5"

                                        style={{
                                            background: 'rgba(239,68,68,0.08)',
                                            border: '1px solid rgba(239,68,68,0.2)'
                                        }}
                                    >

                                        <p className="text-red-400 text-xs">
                                            {errorMsg}
                                        </p>

                                    </div>

                                )}


                                {/* Upload Button */}

                                {status === 'success' ? (

                                    <div className="flex items-center justify-center gap-2 py-3">

                                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">

                                            <svg
                                                width="16"
                                                height="16"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="#10b981"
                                                strokeWidth="2.5"
                                            >
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>

                                        </div>


                                        <p className="text-emerald-400 text-sm">
                                            Imported successfully!
                                        </p>

                                    </div>

                                ) : (

                                    <button
                                        type="button"

                                        onClick={handleUpload}

                                        disabled={status === 'uploading'}

                                        className="w-full bg-white text-black text-sm font-semibold rounded-2xl py-3 flex items-center justify-center gap-2 active:scale-95 transition-all duration-75 disabled:opacity-50"
                                    >

                                        {status === 'uploading' ? (

                                            <>

                                                <div className="w-4 h-4 rounded-full border-2 border-black/30 border-t-black animate-spin" />

                                                Importing...

                                            </>

                                        ) : (

                                            'Confirm & Import'

                                        )}

                                    </button>

                                )}

                            </>

                        )}

                    </motion.div>

                </motion.div>

            )}

        </AnimatePresence>
    )
}

export default UploadStatementModal