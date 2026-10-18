import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axios";

export default function BugReportModal({ onClose }) {
  const [title, setTitle] = useState("");
  const [screenshot, setScreenshot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleScreenshot = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setScreenshot(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setLoading(true);
    try {
      await api.post("/bugreport", { title, screenshot });
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
          className="bg-[#111111] border border-white/10 rounded-2xl w-full max-w-md p-6 flex flex-col gap-5"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
        >
          {success ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <div className="text-4xl">🐛</div>
              <h2 className="text-white text-[28px] font-semibold">Report Received</h2>
              <p className="text-white/50 text-[14px]">I will look into it. Thanks for helping improve Artha.</p>
              <button onClick={onClose} className="mt-4 px-20 py-2 rounded-xl bg-white text-black text-m font-semibold">Close</button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-white text-lg font-semibold">Report a problem</h2>
                <button onClick={onClose} className="text-white/40 hover:text-white text-xl">✕</button>
              </div>

              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's the issue? *"
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/30 outline-none focus:border-white/30"
              />

              <div className="flex flex-col gap-2">
                <label className="text-white/40 text-xs">Attach a screenshot (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleScreenshot}
                  className="text-white/50 text-sm file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:bg-white/10 file:text-white/70 file:text-xs cursor-pointer"
                />
                {screenshot && (
                  <img src={screenshot} alt="preview" className="rounded-xl max-h-40 object-cover mt-1 border border-white/10" />
                )}
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading || !title.trim()}
                className="w-full py-3 rounded-xl bg-white text-black text-sm font-semibold disabled:opacity-40 mt-1"
              >
                {loading ? "Sending..." : "Send Report"}
              </button>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}