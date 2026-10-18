export default function NewBadge({ side = 'right' }) {
    return (
        <span
            className="absolute text-[10px] font-extrabold tracking-widest uppercase px-2 py-0.5 rounded-[6px]"
            style={{
                background: 'linear-gradient(135deg, #a78bfa, #6366f1)',
                color: 'black',
                boxShadow: '0 0 8px rgba(139, 92, 246, 0.5)',
                letterSpacing: '0.08em',
                top: '50%',
                transform: 'translateY(-50%)',
                ...(side === 'right' ? { right: 0 } : { left: 0 })
            }}
        >
            New
        </span>
    )
} 