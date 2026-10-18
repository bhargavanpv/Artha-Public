import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import bgImage from "../assets/Landing-BG.jpg"
import { useEffect, useState } from "react";

import bgImageGreen from "../assets/greenBG.png"
import bgImageTeal from "../assets/tealGreen.png"
import green from "../assets/hue-changed-image.png"

const Landing = () => {
    
    const navigate = useNavigate()
    const [text, setText] = useState("");
    const [taglineIndex, setTaglineIndex] = useState(0);

    const taglines = [
        "Made by Bhargavan PV      :) ",
        "Your Finances — Explained.",
        "Your Finance — Summarized.",
        "Know Where Your Money Goes.",
        "Spend Smarter. Live Better.",
        "Your Money. Your Clarity.",
        ];

    useEffect( ()=>{
        let index = 0;
        let typingInterval;
        let fadeTimeout;
        let nextTaglineTimeout;

        const currentTagline = taglines[taglineIndex];

        const startTyping = setTimeout(()=>{     

            typingInterval = setInterval(()=>{

                setText(currentTagline.slice(0, index+1));
                index++;

                if( index === currentTagline.length){
                    clearInterval(typingInterval);

                    //wait 2 second after typing finishes
                    fadeTimeout = setTimeout(()=>{
                        setText("");

                        //wait for fade to finish then move to next tagline
                        
                        nextTaglineTimeout = setTimeout(()=> {
                            setTaglineIndex(
                                (prev) => (prev + 1) % taglines.length
                            );
                        }, 700) // duration from fading -> next tagline
                    }, 1000); // duration of each tagline
                }
            }, 45); // typing speed
        },1000); //appear after 1s after Artha appears

        return () => {
            clearTimeout(startTyping);
            clearInterval(typingInterval);
            clearTimeout(fadeTimeout);
            clearTimeout(nextTaglineTimeout);
        };
    }, [taglineIndex]);

    return(
        <motion.div 
        className="select-none min-h-screen bg-cover bg-center bg-no-repeat justify-center px-6 flex flex-col items-center  "
            style={{ 
                backgroundImage:`url(${bgImage})`,
            }}
        >

            {/* logo here */}
            <div style={{ fontFamily: "'EB Garamond', serif" }} className=" flex flex-col items-center ">
                <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                className="text-8xl ease-in font-bold text-white tracking-tight">
                    Artha
                </motion.h1>

                <div className="relative h-8 w-full mb-12 flex items-center justify-center">
                    <AnimatePresence mode="wait">
                        {text && (
                            <motion.p
                                key="tagline"
                                initial = {{opacity:0}}
                                animate ={{opacity:1}}
                                exit={{opacity:0}}
                                transition={{
                                    duration: 0.7, 
                                    ease: "easeIn"}}
                                className="h-8 text-zinc-200 text-lg text-center "
                            >
                                {text}
                            </motion.p>
                        )}
                    </AnimatePresence>
                </div>

            </div>
            
            {/* Buttons */}

            <motion.div
             style={{ fontFamily: "'EB Garamond', serif" }}
                initial={{ opacity: 0}}
                animate={{ opacity: 1 }}
                transition={{ duration: 2, delay: 1.5}}
                className="flex flex-row gap-4 w-full max-w-xs "
            >
                <motion.button
                    onClick={ () => navigate('/register') }
                    className="w-full h-10 bg-white hover:text-black hover:bg-indigo-400 text-black font-semibold rounded-xl transition-all duration-400 cursor-pointer "
                >
                    Get Started
                </motion.button>
                
                <button
                    onClick={ () => navigate('/login') }
                    className=" w-full bg-zinc-900 hover:bg-zinc-800 text-white font-semibold rounded-xl transition-all duration-300 h-10 cursor-pointer"
                >
                    Sign In
                </button>

            </motion.div>

               

        </motion.div>
    )
}

export default Landing;