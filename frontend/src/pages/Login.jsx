import bgImage from "../assets/Landing-BG.jpg"
import bgImageGreen from "../assets/greenBG.png"
import bgImageTeal from "../assets/tealGreen.png"
import green from "../assets/hue-changed-image.png"

import api from "../api/axios"

import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"

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

const Login = () => {
    const navigate = useNavigate();
    const [stage, setStage ] = useState(0);
    const [email, setEmail ] = useState("")
    const [password, setPassword ] = useState("")
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)
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
            handleLogin;
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
        }, []);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(""), 2000);
            return () => clearTimeout(timer);
        }
        }, [error]);

    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

        
        
        const handleLogin = async () => {
            if (!isValidEmail(email)) { setError("Enter a valid email address"); setLoadingMsg(""); return; }
            setError("");
            setLoadingMsg("Logging in...");

            try {
                const res = await api.post("/auth/login", { email, password });
                localStorage.setItem("token", res.data.token);
                localStorage.setItem("name", res.data.user.name);
                setLoadingMsg("");
                setSuccess(true);
                setTimeout(() => navigate("/home"), 1500);
            } catch(err) {
                const message = err.response?.data?.message || "Something went wrong";
                setError(message);
                setLoadingMsg("");
            }
        };

    return (
        <>
            <motion.div 

                style={{ backgroundImage: `url(${bgImage})`,
                fontFamily: "'EB Garamond', serif",}}
                className=" relative min-h-screen bg-cover bg-center bg-no-repeat text-white px-6 flex items-center justify-center">

                <motion.div 
                    initial={{ opacity: 0}}
                    animate={{ opacity: stage === 0? 0.3 : 0.75}}
                    transition={{duration: 3}} 
                    className="absolute inset-0 bg-black pointer-events-none"/>

                    
                
                    <ErrorToast message={error}/>

                    <motion.button 
                    onClick={() => navigate('/')} 
                    initial={{ opacity: 0}}
                    animate={{ opacity: 1}}
                    transition={{ duration : 1 , delay: 1.5}}
                    style={{padding:"4px 20px"}}
                    className="select-none absolute rounded-xl top-1 left-1 text-zinc-300 hover:text-white z-500 active:bg-[#08080853] cursor-pointer transition-all duration-300 active:scale-80 ">
                        ← Back
                    </motion.button>

                    <div className="relative w-full z-10 min-h-screen flex flex-col items-center justify-center max-w-sm mx-auto gap-6 ">
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
                            initial={{ opacity:0 , y:20}}
                            animate={{ opacity:1 , y:0}}
                            transition={{duration:0.8, ease:"easeOut"}}
                            className="text-8xl select-none font-bold"
                            
                            >
                                Artha
                            </motion.h1>

                            
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: stage === 1? 1 : 0 }}
                                transition={{ duration:1, delay : 0.3}}
                                className="select-none text-white/70 mt-2"
                            >
                                Welcome Back
                            </motion.p>

                        </motion.div>

                        {/* inputscontainer */}
                        <motion.div
                            initial={{ opacity: 0, y:20 }}
                            animate={{ opacity:1 , y:0}}
                             transition={{duration: 0.6, delay:1.5}}

                            className="w-full flex flex-col gap-4">

                            <div>
                                <label className="select-none text-sm text-zinc-400 block"
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
                                    className="w-full h-10 py-3 rounded-xl bg-zinc-900 text-white placeholder-zinc-500 outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="select-none block text-sm text-zinc-400">Password</label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e)=>setPassword(e.target.value)}
                                    style={{
                                        paddingLeft:"14px"
                                    }}
                                    className="w-full h-10 py-3 rounded-xl bg-zinc-900 text-white placeholder-zinc-500 outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <button
                            onClick={handleLogin}
                            disabled={!!loadingMsg || success}
                            className={`w-full font-bold h-10 rounded-xl transition-all duration-300 ${
                                success 
                                ? "bg-green-700 text-white" 
                                : "bg-white text-black hover:bg-indigo-400"
                            }`}
                            >
                            {success ? "✓ Welcome back" : loadingMsg ? loadingMsg : "Log In"}
                            </button>

                            <p className="select-none text-center text-zinc-400 text-sm">
                            Don't have an account?{" "}
                            <span onClick={() => navigate('/register')} className="text-indigo-200 cursor-pointer hover:underline font-semibold transition-all duration-1000 ">
                                Create one
                            </span>
                            </p>
                        </motion.div>
                    </div>
                
            </motion.div>
        </>
  );
};

export default Login;