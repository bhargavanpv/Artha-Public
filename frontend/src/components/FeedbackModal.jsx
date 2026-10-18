import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axios";

const PLACEHOLDERS = [
  "Friend of Bhargav",
  "Student at VIT Chennai",
  "CFO at Reddington",
  "SWE at Amazon",
  "CA at Deloitte",
  "Founder at a startup",
  "Product Manager at Flipkart",
  "Data Analyst at KPMG",
  "Freelance Developer",
  "Finance Student",
];

function FeedbackModal({ onClose }) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [name, setName] = useState("")
  const [designation, setDesignation] = useState("");
  const [mainFeedback, setMainFeedback] = useState("");
  const [detailedExperience, setDetailedExperience] = useState("");
  const [consentToDisplay, setConsentToDisplay] = useState(false);
  const [anonymous, setAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Typewriter placeholder
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [displayedPlaceholder, setDisplayedPlaceholder] = useState("");
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    const getname = localStorage.getItem("name");
    setName(getname)
    let timeout;
    const current = PLACEHOLDERS[placeholderIndex];
    if (typing) {
      if (displayedPlaceholder.length < current.length) {
        timeout = setTimeout(() => {
          setDisplayedPlaceholder(current.slice(0, displayedPlaceholder.length + 1));
        }, 60);
      } else {
        timeout = setTimeout(() => setTyping(false), 900);
      }
    } else {
      if (displayedPlaceholder.length > 0) {
        timeout = setTimeout(() => {
          setDisplayedPlaceholder(displayedPlaceholder.slice(0, -1));
        }, 30);
      } else {
        setPlaceholderIndex((i) => (i + 1) % PLACEHOLDERS.length);
        setTyping(true);
      }
    }
    return () => clearTimeout(timeout);
  }, [displayedPlaceholder, typing, placeholderIndex]);

  const handleSubmit = async () => {
    if (!mainFeedback.trim()) return;
    setLoading(true);
    try {
      await api.post("/feedback", {
        designation,
        mainFeedback,
        detailedExperience,
        consentToDisplay,
        anonymous,
      });
      setSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-[#111111] border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 flex flex-col gap-5"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
        >
          {success ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <h2 className="text-white text-2xl font-semibold">Thank you for your feedback</h2>
                <p className="text-white/50 text-sm whitespace-pre-line">
                    It means a lot to us
                </p>
              <button onClick={onClose} className="mt-4 px-6 py-2 rounded-xl bg-white text-black text-sm font-medium">Close</button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-white text-lg font-semibold">Share your feedback</h2>
                <button onClick={onClose} className="text-white/40 hover:text-white text-xl">✕</button>
              </div>

              {/* Live Preview */}
              {mainFeedback && (
                <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4 flex flex-col gap-1">
                  <p className="text-white/90 text-sm italic">"{mainFeedback}"</p>
                  {detailedExperience && <p className="text-white/50 text-xs mt-1">{detailedExperience}</p>}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs text-white/60">
                      {anonymous ? "?" : user?.name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <p className="text-white text-xs font-medium">{anonymous ? "Anonymous" : name || "You"}</p>
                      {designation && <p className="text-white/40 text-xs">{designation}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Designation */}
              <p className="text-zinc-600 text-sm -mb-3 ml-1">Enter your designation ( optional ) </p>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder={displayedPlaceholder}
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/30 outline-none focus:border-white/30"
              />

              {/* Main Feedback */}
              <textarea
                rows={1}
                value={mainFeedback}
                onChange={(e) => setMainFeedback(e.target.value)}
                placeholder="What do you think of Artha? *"
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/30 outline-none focus:border-white/30 resize-none"
              />

              {/* Detailed Experience */}
              <textarea
                rows={5}
                value={detailedExperience}
                onChange={(e) => setDetailedExperience(e.target.value)}
                placeholder="Want to describe your experience a bit more? (optional)"
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/30 outline-none focus:border-white/30 resize-none"
              />

              {/* Consent */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentToDisplay}
                  onChange={(e) => setConsentToDisplay(e.target.checked)}
                  className="accent-white w-4 h-4"
                />
                <span className="text-white/60 text-sm">I'm okay with Artha displaying my review on their website</span>
              </label>

              {/* Anonymous toggle — only show if consented */}
              {consentToDisplay && (
                <label className="flex items-center gap-3 cursor-pointer ">
                  <input
                    type="checkbox"
                    checked={anonymous}
                    onChange={(e) => setAnonymous(e.target.checked)}
                    className="accent-white w-4 h-4"
                  />
                  <span className="text-white/60 text-sm">Display me anonymously (hide my name)</span>
                </label>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading || !mainFeedback.trim()}
                className="w-full py-3 rounded-xl bg-white text-black text-sm font-semibold disabled:opacity-40 mt-1"
              >
                {loading ? "Sending..." : "Submit Feedback"}
              </button>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default FeedbackModal