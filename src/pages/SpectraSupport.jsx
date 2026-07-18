import React, { useState, useEffect, useRef } from "react";
import Spline from "@splinetool/react-spline";
import styled from "styled-components";
import { askGeneralAgent } from "../api/sarvamAgent.js";
import { HeroDesign } from "../components/home/HeroDesign.jsx";
import { MdMic, MdMicOff } from "react-icons/md";

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background-color: #050505;
`;

const UIOverlay = styled.div`
  position: absolute;
  bottom: 10%;
  left: 0;
  width: 100%;
  pointer-events: none;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const MicButton = styled.button`
  pointer-events: auto;
  background: ${(props) =>
    props.$isListening ? "#ef4444" : "var(--color-primary)"};
  color: blue;
  border: none;
  border-radius: 50px;
  padding: 1%;
  font-size: 2rem;
  font-weight: 900;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;
  box-shadow: ${(props) =>
    props.$isListening
      ? "0 0 30px rgba(239, 68, 68, 0.6)"
      : "0 0 30px rgba(var(--color-primary-rgb), 0.6)"};
`;

export default function SpectraSupport() {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef(null);

  const speak = async (text) => {
    try {
      const apiKey = import.meta.env.VITE_SARVAM_API_KEY;
      if (!apiKey) throw new Error("No API key");
      
      // Ponytail: Sarvam TTS limits inputs to 500 characters max and max 3 array items.
      // We enforce brevity at the LLM level, and safety-slice it here to guarantee the API never crashes.
      const safeText = text.length > 499 ? text.slice(0, 499) : text;
      
      const res = await fetch("https://api.sarvam.ai/text-to-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json", "api-subscription-key": apiKey },
        body: JSON.stringify({
          inputs: [safeText],
          target_language_code: "en-IN",
          speaker: "shubh",
          pace: 1.0,
          speech_sample_rate: 16000,
          enable_preprocessing: true,
          model: "bulbul:v3"
        })
      });
      
      if (!res.ok) {
        const errText = await res.text();
        console.error("Sarvam TTS HTTP Error:", res.status, errText);
        throw new Error("Sarvam TTS API Failed");
      }
      
      const data = await res.json();
      const base64Audio = data.audios[0];
      const audio = new Audio("data:audio/wav;base64," + base64Audio);
      audio.play();
    } catch (err) {
      console.warn("// Ponytail: Sarvam TTS failed (key/network). Falling back to native.", err);
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      let selectedVoice = voices.find((v) => v.lang.includes("en"));
      const indianVoice = voices.find(
        (v) => v.name.toLowerCase().includes("shubh") || v.lang.includes("IN"),
      );
      if (indianVoice) selectedVoice = indianVoice;

      if (selectedVoice) utterance.voice = selectedVoice;
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    // Play free will audio
    const greetingAudio = new Audio("/speech.mp3");
    greetingAudio.play().catch(e => console.warn("Browser autoplay blocked free-will audio:", e));
    
    // Ponytail: Skipped Sarvam STT (Speech-to-Text) due to browser MediaRecorder 
    // lacking native WAV/MP3 encoding without heavy polyfills. Retained native 
    // SpeechRecognition for zero-latency, cross-browser compatibility.

    // Initialize Speech Recognition
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = async (event) => {
        const currentTranscript = event.results[0][0].transcript;
        console.log("[Spectra STT] User heard:", currentTranscript);
        setIsListening(false);
        await processInput(currentTranscript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      window.speechSynthesis.cancel();
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const processInput = async (text) => {
    setIsProcessing(true);
    console.log("[Spectra Agent] Processing input:", text);

    try {
      const generalResponse = await askGeneralAgent(text);
      const responseText = generalResponse || "I'm sorry, I couldn't understand that request.";
      console.log("[Spectra Agent] AI Response:", responseText);
      speak(responseText);
    } catch (err) {
      console.error("[Spectra Agent] Processing error:", err);
      speak("Sorry, I encountered an issue while processing your request.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="spectra">
      <Container className="bg-grid-overlay">
        <div className="spectraai">
          <HeroDesign />
        </div>
        <UIOverlay>
          <MicButton
            onClick={toggleListen}
            $isListening={isListening}
            disabled={isProcessing}
          >
            {isListening ? <MdMicOff size={48} /> : <MdMic size={48} />}
            {isListening ? "" : isProcessing ? "..." : ""}
          </MicButton>
        </UIOverlay>
      </Container>
    </div>
  );
}
