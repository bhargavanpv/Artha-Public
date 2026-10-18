export default function UnlockedBadge({ side = 'right' }) {
    return (
        <span
            className="absolute text-[9px] font-extrabold tracking-widest uppercase px-2 py-0.5 rounded-[6px]"
            style={{
                background: 'linear-gradient(135deg, #E73F1E, #FB6C00, #F9B637 , #FFDD9C)',
                color: 'black',
                boxShadow: '0 0 15px gold',
                letterSpacing: '0.08em',
                top: '50%',
                transform: 'translateY(-50%)',
                ...(side === 'right' ? { right: 0 } : { left: 0 })
            }}
        >
            Unlocked
        </span>
    )
} 