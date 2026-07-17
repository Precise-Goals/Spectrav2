import { useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// --- Styled Components ---

const HeroContainer = styled.section`
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 0 2rem;
  /* Ensure it sits above the background but below sticky nav */
  position: relative;
  z-index: 10;
`;

const HeadlineWrapper = styled(motion.h1)`
  font-size: clamp(3.5rem, 8vw, 6.5rem);
  font-weight: 800;
  line-height: 1.1;
  color: #ffffff;
  margin-bottom: 2rem;
  max-width: 1100px;
  /* display: flex with wrap allows words to flow naturally on smaller screens */
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.25em; /* Space between words */
`;

const Word = styled(motion.span)`
  display: inline-block;
  will-change: transform, opacity;
`;

const Subtitle = styled(motion.p)`
  font-size: clamp(1rem, 2vw, 1.25rem);
  color: rgba(255, 255, 255, 0.6);
  max-width: 600px;
  margin-bottom: 3.5rem;
  line-height: 1.6;
`;

/* Keyframes for the dynamic shifting gradient */
const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const StyledCTA = styled(motion.button)`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 3rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: #ffffff;
  border: none; /* No harsh borders */
  border-radius: 9999px; /* Pill shape */
  cursor: pointer;
  outline: none;
  overflow: hidden;
  
  /* Dynamic gradient background */
  background: linear-gradient(
    270deg,
    #B026FF,   /* Neon Purple */
    #7B26FF,   /* Deeper Purple */
    #FF26E1,   /* Neon Pink */
    #B026FF    /* Back to Neon Purple */
  );
  background-size: 300% 300%;
  animation: ${gradientShift} 8s ease infinite;
  
  /* Drop shadow for extra glow */
  box-shadow: 0 4px 20px rgba(176, 38, 255, 0.4);
  transition: box-shadow 0.3s ease;

  &:hover {
    box-shadow: 0 8px 30px rgba(176, 38, 255, 0.6);
  }
`;

// --- Components ---

/**
 * MagneticButton applies a spring physics effect that pulls the button 
 * slightly towards the user's cursor when hovered.
 */
const MagneticButton = ({ children, onClick }) => {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e) => {
    if (!ref.current) return;
    
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    
    // Calculate cursor position relative to the center of the element
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    
    // Pull the element towards the cursor (20% of the distance)
    setPosition({ x: middleX * 0.2, y: middleY * 0.2 });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <StyledCTA
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      onClick={onClick}
      animate={{ x: position.x, y: position.y }}
      transition={{ 
        type: "spring",
        // Cinematic magnetic feel: enough stiffness for clear pull,
        // but high damping + meaningful mass ensure a slow, elegant release
        // with zero bounce — the hallmark of Awwwards-tier interactions.
        stiffness: 90,
        damping: 22,
        mass: 0.6,
      }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </StyledCTA>
  );
};

export default function Hero() {
  const navigate = useNavigate();
  const headlineText = "Trade with Intents. Seamlessly.";
  // Split the text into an array of words
  const words = headlineText.split(" ");

  // Framer Motion variants for the staggering container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12, // Delay between each word
        delayChildren: 0.2,    // Initial delay before starting
      },
    },
  };

  // Framer Motion variants for each individual word
  const wordVariants = {
    hidden: { 
      opacity: 0, 
      y: 40 // Start slightly below
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        // Overdamped: words float up and settle immediately with no
        // oscillation — like ink spreading through water. Cinematic & clean.
        damping: 28,
        stiffness: 60,
      }
    },
  };

  return (
    <HeroContainer>
      {/* Kinetic Typography Headline */}
      <HeadlineWrapper
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {words.map((word, index) => (
          <Word key={index} variants={wordVariants}>
            {word}
          </Word>
        ))}
      </HeadlineWrapper>

      {/* Subtitle */}
      <Subtitle
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.8, ease: "easeOut" }}
      >
        Experience the next generation of decentralized finance. Just tell our AI Agent what you want to achieve, and we handle the complex execution.
      </Subtitle>

      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.8, ease: "easeOut" }}
      >
        <MagneticButton onClick={() => navigate('/agent')}>
          Launch App
        </MagneticButton>
      </motion.div>
    </HeroContainer>
  );
}
