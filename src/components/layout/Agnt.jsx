import { useState, useEffect } from "react";
import Spline from "@splinetool/react-spline";
import scene from "/agnt.splinecode";

// Suppress harmless Spline async errors that spam the console
const useSuppressSplineError = () => {
  useEffect(() => {
    const handleError = (e) => {
      if (e.message && e.message.includes("reading 'position'")) {
        e.preventDefault(); // Stop the error from hitting the console
      }
    };
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);
};

export const HeroDesign = () => {
  const [isMounted, setIsMounted] = useState(false);
  useSuppressSplineError(); // Activate error suppression

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div id="agnt-spline" style={{ width: "100%" }}>
      {isMounted && <Spline scene={scene} className="agntt" />}
    </div>
  );
};
