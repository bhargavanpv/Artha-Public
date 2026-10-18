import bgImage from "../assets/Landing-BG.jpg"
import bgImageGreen from "../assets/greenBG.png"
import bgImageTeal from "../assets/tealGreen.png"
import green from "../assets/hue-changed-image.png"

import api from "../api/axios"

import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"

const SuccessModal = ({ message }) => {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="bg-[#111111] border border-white/10 rounded-2xl px-10 py-10 flex flex-col items-center gap-4 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center"
            >
              <span className="text-3xl">✓</span>
            </motion.div>
            <h2 className="text-white text-xl font-semibold">Welcome to Artha</h2>
            <p className="text-white/50 text-sm">{message}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const ErrorToast = ({ message }) => {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ y: -80, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -80, opacity: 0, scale: 0.8 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-50"
          style={{
            background: "rgba(30, 10, 10, 0.75)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255,80,80,0.2)",
            borderRadius: "14px",
            padding: "10px 20px",
            boxShadow: "0 16px 32px rgba(0,0,0,0.4), 0 0 0 0.5px rgba(255,80,80,0.15)",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <span className="text-white/90 text-sm font-medium whitespace-nowrap" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif", letterSpacing: "-0.01em" }}>
            {message}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
 
const Register = () => {

    const navigate = useNavigate();
    const [stage, setStage ] = useState(0);
    const [name, setName] = useState("")
    const [email, setEmail ] = useState("")
    const [password, setPassword ] = useState("")
    const [confirmPWD, setConfirmPWD] = useState("")
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [loadingMsg, setLoadingMsg] = useState("");

    useEffect(()=>{
        // const timer = setTimeout(()=>{},700) - first animation
        const timer = setTimeout(()=>{
            setStage(1);
        },700)

        return() => clearTimeout(timer);
    },[])

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Enter") {
                handleRegister();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [name, email, password, confirmPWD]); 

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(""), 2000);
            return () => clearTimeout(timer);
        }
        }, [error]);
    
    const getPasswordStrength = (pwd) => {
        if (!pwd) return null;
        if (pwd.length < 6) return { label: "Too short", color: "#ef4444", width: "25%" };
        if (pwd.length < 8 || !/[0-9]/.test(pwd)) return { label: "Weak", color: "#f97316", width: "50%" };
        if (!/[A-Z]/.test(pwd) || !/[!@#$%^&*]/.test(pwd)) return { label: "Medium", color: "#eab308", width: "75%" };
        return { label: "Strong", color: "#22c55e", width: "100%" };
        };

    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const handleRegister = async () =>{
        
        if (!name.trim()) { setError("Kindly enter your name"); setLoadingMsg(""); return; }
        if (!isValidEmail(email)) { setError("Enter a valid email address"); setLoadingMsg(""); return; }
        if (password.length < 6) { setError("Password must be at least 6 characters"); setLoadingMsg(""); return; }
        if (password !== confirmPWD) { setError("Passwords do not match"); setLoadingMsg(""); return; }

        setError("");
        setLoadingMsg("Creating your account...")

        try{
            if(password!==confirmPWD){
                setError("Passwords do not match");
                setLoadingMsg("")
                return;
            }

            const res = await api.post("/auth/register", { name, email, password });
            
            setLoadingMsg("Setting up your categories...")
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("name", res.data.user.name);
            localStorage.setItem("artha-new-user", "true");    
            
           setLoadingMsg("Almost there...")
           setSuccess("Your account has been created :P");
           setLoadingMsg("")

            setTimeout(()=> {
                navigate("/home");
            }, 1500)
        }
        catch(err){
            const message = err.response?.data?.message || "Something went wrong - Please try again";
            setError(message);
            setLoadingMsg("");
        }

    }

    return (
        <>
            <motion.div 
                style={{ backgroundImage: `url(${bgImage})`,
                fontFamily: "'EB Garamond', serif", }}
                className=" relative min-h-screen bg-cover bg-center bg-no-repeat text-white px-6 flex items-center justify-center">

                <motion.div 
                    initial={{ opacity: 0}}
                    animate={{ opacity: stage === 0? 0.3 : 0.7}}
                    transition={{duration: 6, ease:"easeOut"}} 
                    className="absolute inset-0 bg-black pointer-events-none"/>

                    <SuccessModal message={success}/>
                    <ErrorToast message={error}/>
                    
                    {/* back button */}
                    <motion.button 
                    onClick={() => navigate('/')} 
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: stage === 1 ? 1 : 0, x: stage === 1 ? 0 : -50 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                    style={{ padding:"4px 20px" }}
                    className="select-none absolute text-center rounded-xl top-4 left-2 text-zinc-300 active:text-white z-50 active:bg-[#08080853] cursor-pointer transition-colors duration-300">
                        ← Back
                    </motion.button>

                    <div className="relative w-full z-10 min-h-screen flex flex-col items-center justify-center max-w-sm mx-auto gap-6">
                        <motion.div
                            layout
                            transition={{ duration:0.3, ease:"easeInOut" }}
                            className={
                                stage===0
                                ? "flex flex-col items-center"
                                : "flex flex-col items-center mb-4"
                            }
                        >
                            <motion.h1 
                            initial={{ opacity: 0, y:10}}
                            animate={{ opacity: 1, y:0 }}
                            style={{marginBottom:"10px"}}
                            transition={{duration:0.7}}
                            className="text-6xl select-none font-bold"
                            
                            >
                                Register
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration:1.5, delay : 1.6}}
                                className="text-zinc-300 select-none mt-2"
                            >
                                Welcome to Artha
                            </motion.p>

                        </motion.div>

                        {/* inputscontainer */}
                        <motion.div
                            initial={{ opacity:0 , y: 20}}
                            animate={{ opacity: stage=== 1?1:0, y:stage===1?0:20}}
                            transition={{duration:0.6, delay:0.7}}
                            className="w-full flex flex-col gap-4">

                            <div>
                                <label className="select-none block text-sm text-zinc-200">Your Name</label>
                                <input
                                    type="text"
                                    placeholder="What should we call you?"
                                    value={name}
                                    onChange={(e)=>setName(e.target.value)}
                                    style={{
                                        paddingLeft:"14px"
                                    }}
                                    className="w-full mt-1 h-10 py-3 rounded-xl bg-zinc-900 text-white placeholder-zinc-500 outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="select-none text-sm text-zinc-200 block"
                                >Email
                                </label>

                                <input
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    style={{
                                        paddingLeft:"14px"
                                    }}
                                    onChange={(e)=> setEmail(e.target.value)}
                                    className="w-full mt-1 h-10 py-3 rounded-xl bg-zinc-900 text-white placeholder-zinc-500 outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="select-none block text-sm text-zinc-200">Password</label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e)=>setPassword(e.target.value)}
                                    style={{
                                        paddingLeft:"14px"
                                    }}
                                    className="w-full mt-1 h-10 py-3 rounded-xl bg-zinc-900 text-white placeholder-zinc-500 outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            {password && (() => {
                                const strength = getPasswordStrength(password);
                                return (
                                    <div className="flex flex-col gap-1 mt-1">
                                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                        <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: strength.width }}
                                        transition={{ duration: 0.3 }}
                                        style={{ height: "100%", backgroundColor: strength.color, borderRadius: "999px" }}
                                        />
                                    </div>
                                    <p className="text-xs" style={{ color: strength.color }}>{strength.label}</p>
                                    </div>
                                );
                                })()}

                            <div>
                                <label className="select-none block text-sm text-zinc-200">Confirm Password</label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={confirmPWD}
                                    onChange={(e)=>setConfirmPWD(e.target.value)}
                                    style={{
                                        paddingLeft:"14px"
                                    }}
                                    className="w-full mt-1 h-10 py-3 rounded-xl bg-zinc-900 text-white placeholder-zinc-500 outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <button 
                            disabled={!!loadingMsg}
                            onClick={handleRegister}
                            className="select-none w-full bg-white text-black font-bold h-10 rounded-xl hover:bg-indigo-400 hover:text-black transition-all cursor-pointer duration-300">
                                {loadingMsg ? loadingMsg :"Create Account"}
                            </button>

                            <p className="text-center text-white/30 text-xs">
                                By creating an account you agree to our{" "}
                                <span onClick={() => navigate('/terms')} className="underline cursor-pointer hover:text-white/60">Terms</span>
                                {" "}and{" "}
                                <span onClick={() => navigate('/privacy')} className="underline cursor-pointer hover:text-white/60">Privacy Policy</span>
                            </p>

                            <p className="select-none text-center text-zinc-400 text-sm">
                            You already have an account? {" "}
                            <span onClick={() => navigate('/login')} className="text-white cursor-pointer hover:underline font-semibold transition-all duration-1000 ">
                               Log in
                            </span>
                            </p>
                        </motion.div>
                    </div>
                
            </motion.div>
            
        </>
  );
};

export default Register;