// src/components/AppTour.jsx
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

const TOUR_STYLES = `
  .driver-popover {
    background: #141414 !important;
    border: 1px solid rgba(255,255,255,0.1) !important;
    border-radius: 24px !important;
    padding: 24px !important;
    box-shadow: 0 0 0 1px rgba(99,102,241,0.15), 0 24px 80px rgba(0,0,0,0.8) !important;
    max-width: 280px !important;
    min-width: 260px !important;
  }

  .driver-popover-title {
    font-family: 'EB Garamond', serif !important;
    font-size: 1.4rem !important;
    font-weight: 700 !important;
    color: #ffffff !important;
    margin-bottom: 8px !important;
    line-height: 1.2 !important;
  }

  .driver-popover-description {
    font-size: 0.82rem !important;
    color: #a1a1aa !important;
    line-height: 1.6 !important;
    font-family: 'Inter', sans-serif !important;
  }

  .driver-popover-footer {
    margin-top: 20px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    gap: 8px !important;
  }

  .driver-popover-progress-text {
    color: #3f3f46 !important;
    font-size: 0.7rem !important;
    font-family: 'Inter', sans-serif !important;
    letter-spacing: 0.05em !important;
  }

  .driver-popover-prev-btn {
    background: transparent !important;
    border: 1px solid rgba(255,255,255,0.08) !important;
    color: #71717a !important;
    border-radius: 14px !important;
    font-size: 0.75rem !important;
    padding: 8px 16px !important;
    font-family: 'Inter', sans-serif !important;
    cursor: pointer !important;
    transition: all 0.2s !important;
  }

  .driver-popover-prev-btn:hover {
    border-color: rgba(255,255,255,0.15) !important;
    color: #a1a1aa !important;
  }

  .driver-popover-next-btn {
    background: rgba(99,102,241,0.25) !important;
    border: 1px solid rgba(99,102,241,0.5) !important;
    color: #c7d2fe !important;
    border-radius: 14px !important;
    font-size: 0.75rem !important;
    padding: 8px 18px !important;
    font-family: 'Inter', sans-serif !important;
    font-weight: 600 !important;
    cursor: pointer !important;
    transition: all 0.2s !important;
  }

  .driver-popover-next-btn:hover {
    background: rgba(99,102,241,0.4) !important;
    border-color: rgba(99,102,241,0.7) !important;
  }

  .driver-popover-close-btn {
    position: absolute !important;
    top: 16px !important;
    right: 16px !important;
    width: 28px !important;
    height: 28px !important;
    border-radius: 50% !important;
    background: rgba(255,255,255,0.06) !important;
    border: 1px solid rgba(255,255,255,0.08) !important;
    color: #52525b !important;
    font-size: 0.75rem !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    cursor: pointer !important;
    transition: all 0.2s !important;
    padding: 0 !important;
    line-height: 1 !important;
  }

  .driver-popover-close-btn:hover {
    background: rgba(255,255,255,0.1) !important;
    color: #a1a1aa !important;
  }

  .driver-overlay {
    background: rgba(0,0,0,0.15) !important;
  }

  .driver-highlighted-element {
    border-radius: 16px !important;
    box-shadow: 0 0 0 4px rgba(99,102,241,0.2) !important;
  }

  .driver-popover-arrow {
    display: block !important;
  }

  .driver-popover-arrow-side-top .driver-popover-arrow {
    border-bottom-color: #141414 !important;
  }

  .driver-popover-arrow-side-bottom .driver-popover-arrow {
    border-top-color: #141414 !important;
  }

  .driver-popover-arrow-side-left .driver-popover-arrow {
    border-right-color: #141414 !important;
  }

  .driver-popover-arrow-side-right .driver-popover-arrow {
    border-left-color: #141414 !important;
  }
`

export function useAppTour() {
  const navigate = useNavigate()

  const startTour = () => {
    if (!document.getElementById('artha-tour-styles')) {
      const style = document.createElement('style')
      style.id = 'artha-tour-styles'
      style.textContent = TOUR_STYLES
      document.head.appendChild(style)
    }

    const driverObj = driver({
      showProgress: true,
      animate: true,
      overlayOpacity: 0.65,
      stagePadding: 8,
      stageRadius: 16,
      allowClose: true,
      nextBtnText: 'Next →',
      prevBtnText: '← Back',
      doneBtnText: 'Use Artha',
      steps: [
        {
          element: '[data-tour="balance-card"]',
          popover: {
            title: 'Your Balance',
            description: 'Net cash flow : income minus expenses, updated live as you log transactions.',
          },
          onHighlighted: () => navigate('/home'),
        },
        {
          element: '[data-tour="recent-transactions"]',
          popover: {
            title: 'Recent Transactions',
            description: 'Your last 5 transactions at a glance. Tap "See all" to view, filter, sort, and edit every entry.',
          },
        },
        {
          element: '[data-tour="add-btn"]',
          popover: {
            title: 'Log a Transaction',
            description: 'Tap + to manually add an expense or income. Give it a description, amount, category, and date.',
          },
        },
        {
          element: '[data-tour="ai-nav"]',
          popover: {
            title: 'Artha AI',
            description: 'Your personal finance assistant. Ask anything — where you overspent, what your food budget looks like, ANYTHING !!.',
          },
          onHighlighted: () => navigate('/ai'),
        },
        {
          element: '[data-tour="ai-input"]',
          popover: {
            title: 'Ask Anything',
            description: 'Type your question here. Artha AI reads your actual transaction data and gives specific, number-backed answers.',
          },
        },
        {
          element: '[data-tour="ai-credits"]',
          popover: {
            title: 'Daily Credits',
            description: 'Each plan gets a message limit per day. Free gets 2, Plus gets 10, Pro gets 25, Power gets 50. Resets at midnight.',
          },
        },
        {
          element: '[data-tour="charts-nav"]',
          popover: {
            title: 'Charts',
            description: 'Visual breakdown of your spending — daily trends, category splits, top merchants, income vs expenses.',
          },
          onHighlighted: () => navigate('/charts'),
        },
        {
          element: '[data-tour="spending-chart"]',
          popover: {
            title: 'Spending Trend',
            description: 'Toggle between 1W, 1M, 3M, and 6M views. Spot patterns in your daily or monthly spending instantly.',
          },
        },
        {
          element: '[data-tour="category-chart"]',
          popover: {
            title: 'Spending by Category',
            description: 'See which categories drain your wallet the most — ranked by total spend this month.',
          },
        },
        {
          element: '[data-tour="profile-nav"]',
          popover: {
            title: 'Profile and Settings',
            description: 'Manage your account, view AI usage, upgrade your plan, and give feedback.',
          },
          onHighlighted: () => navigate('/profile'),
        },
        {
          element: '[data-tour="account-card"]',
          popover: {
            title: 'Your Account',
            description: 'Tap the pencil to edit your name or change your password anytime.',
          },
        },
        {
          element: '[data-tour="ai-usage"]',
          popover: {
            title: 'AI Usage',
            description: 'Track how many messages you have used today vs your plan limit. The bar turns red when you hit the cap.',
          },
        },
        {
          element: '[data-tour="subscription"]',
          popover: {
            title: 'Your Plan',
            description: 'Tap Upgrade to unlock more AI messages and advanced models. Every tier keeps Artha running.',
          },
        },
      ],
      onDestroyStarted: () => {
        api.patch('/auth/tour-complete').catch(() => {})
        localStorage.setItem('artha-tour-done', 'true')
        driverObj.destroy()
      },
    })

    driverObj.drive()
  }

  return { startTour }
}