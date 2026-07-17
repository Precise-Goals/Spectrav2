import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const BackgroundContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #0A0A0B; // Deep dark base color
  z-index: -9999; // Ensure it sits behind all other content
  overflow: hidden;
  pointer-events: none; // Prevent it from blocking clicks/interactions
`;

const Glow = styled(motion.div)`
  position: absolute;
  top: -400px; // Offset by half of width/height to center the glow on the cursor
  left: -400px;
  width: 800px;
  height: 800px;
  background: radial-gradient(
    circle,
    rgba(176, 38, 255, 0.15) 0%, // Neon-purple (#B026FF) with low opacity
    rgba(176, 38, 255, 0) 70%
  );
  border-radius: 50%;
  filter: blur(80px); // Highly blurred
  will-change: transform; // Optimize for animations
`;

export default function AmbientBackground() {
  const [isMounted, setIsMounted] = useState(false);

  // Setup motion values for mouse coordinates
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Apply spring physics for fluid, cinematic 'ambient orb' movement.
  // High mass + very low stiffness + heavy damping = the glow behaves like
  // a large object suspended in liquid — it lags beautifully behind the cursor
  // and settles with zero oscillation, never snapping or bouncing.
  const springConfig = { damping: 45, stiffness: 18, mass: 2.5 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  useEffect(() => {
    setIsMounted(true);
    
    // Set initial position to center of the screen
    if (typeof window !== 'undefined') {
      mouseX.set(window.innerWidth / 2);
      mouseY.set(window.innerHeight / 2);
    }

    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [mouseX, mouseY]);

  // Render a static background until the component mounts to avoid hydration mismatch
  if (!isMounted) {
    return <BackgroundContainer />;
  }

  return (
    <BackgroundContainer>
      <Glow style={{ x: springX, y: springY }} />
    </BackgroundContainer>
  );
}
