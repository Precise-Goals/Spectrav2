import React, { useState, useEffect, Component } from "react";
import Spline from "@splinetool/react-spline";
import scene from "/design.splinecode";

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
    <div id="hero-spline" style={{ width: "100%", height: "600px", minHeight: "600px", position: "relative" }}>
      {isMounted && <Spline scene={scene} />}
    </div>
  );
};
