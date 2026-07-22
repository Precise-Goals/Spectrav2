import React, { useState, useEffect, useRef, useCallback } from "react";
import Spline from "@splinetool/react-spline";
import styled, { keyframes } from "styled-components";
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

/* ─── Live Caption Box ────────────────────────────────────────────────────── */

const captionFadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

const captionPulse = keyframes`
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
`;

const CaptionOverlay = styled.div`
  position: absolute;
  bottom: 20%;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 600px;
  pointer-events: none;
  z-index: 10;
  display: flex;
  justify-content: center;
`;

const CaptionBox = styled.div`
  background: rgba(10, 10, 12, 0.75);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 16px 24px;
  color: #ffffff;
  font-family: 'Geist', sans-serif;
  font-size: 15px;
  line-height: 1.6;
  text-align: center;
  animation: ${captionFadeIn} 0.3s ease-out;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  max-width: 100%;
`;

const CaptionLabel = styled.span`
  display: block;
  font-family: 'Geist', monospace;
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: ${(props) => props.$type === 'user' ? 'rgba(96, 165, 250, 0.8)' : props.$type === 'agent' ? 'rgba(176, 38, 255, 0.8)' : 'rgba(255,255,255,0.3)'};
  margin-bottom: 6px;
`;

const InterimText = styled.span`
  color: rgba(255, 255, 255, 0.5);
  font-style: italic;
`;

const FinalText = styled.span`
  color: #ffffff;
`;

const TypingDots = styled.span`
  display: inline-block;
  margin-left: 4px;
  animation: ${captionPulse} 1s ease-in-out infinite;
  color: rgba(96, 165, 250, 0.6);
`;

export default function SpectraSupport() {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef(null);

  // Caption state
  const [captionText, setCaptionText] = useState('');
  const [captionInterim, setCaptionInterim] = useState('');
  const [captionType, setCaptionType] = useState(''); // 'user' | 'agent' | 'processing'
  const captionTimerRef = useRef(null);

  const clearCaptionAfterDelay = useCallback((ms = 8000) => {
    if (captionTimerRef.current) clearTimeout(captionTimerRef.current);
    captionTimerRef.current = setTimeout(() => {
      setCaptionText('');
      setCaptionInterim('');
      setCaptionType('');
    }, ms);
  }, []);

  const speak = async (text) => {
    // Show AI response in captions
    setCaptionType('agent');
    setCaptionText(text);
    setCaptionInterim('');
    clearCaptionAfterDelay(10000);

    try {
      const apiKey = import.meta.env.VITE_SARVAM_API_KEY;
      if (!apiKey) throw new Error("No API key");
      
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
    
    // Initialize Speech Recognition with interim results for live captions
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = async (event) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += transcript;
          } else {
            interim += transcript;
          }
        }

        // Update live captions
        if (interim) {
          setCaptionType('user');
          setCaptionInterim(interim);
        }

        if (final) {
          setCaptionType('user');
          setCaptionText(final);
          setCaptionInterim('');
          console.log("[Spectra STT] User heard:", final);
          setIsListening(false);
          await processInput(final);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        setCaptionInterim('');
        setCaptionType('processing');
        
        if (event.error === 'network') {
          setCaptionText("Browser speech recognition failed (Network Error). This happens sometimes on localhost without HTTPS, or if a browser extension is blocking it.");
        } else if (event.error === 'not-allowed') {
          setCaptionText("Microphone access denied. Please allow microphone permissions in your browser.");
        } else {
          setCaptionText(`Microphone error: ${event.error}`);
        }
        clearCaptionAfterDelay(5000);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (captionTimerRef.current) clearTimeout(captionTimerRef.current);
    };
  }, []);

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      window.speechSynthesis.cancel();
      // Reset captions for new listening session
      setCaptionText('');
      setCaptionInterim('');
      setCaptionType('user');
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const processInput = async (text) => {
    setIsProcessing(true);
    setCaptionType('processing');
    setCaptionText(text);
    setCaptionInterim('');
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

  const showCaption = captionText || captionInterim || isListening;

  return (
    <div className="spectra">
      <Container className="bg-grid-overlay">
        <div className="spectraai">
          <HeroDesign />
        </div>

        {/* Live Caption Box — below the Spline bot */}
        {showCaption && (
          <CaptionOverlay>
            <CaptionBox>
              <CaptionLabel $type={captionType}>
                {captionType === 'user' && '🎤 You'}
                {captionType === 'agent' && '✦ Spectra'}
                {captionType === 'processing' && '⟳ Processing'}
                {!captionType && isListening && '🎤 Listening'}
              </CaptionLabel>

              {captionText && <FinalText>{captionText}</FinalText>}
              {captionInterim && (
                <InterimText>
                  {captionText ? ' ' : ''}{captionInterim}
                  <TypingDots>...</TypingDots>
                </InterimText>
              )}
              {isListening && !captionText && !captionInterim && (
                <InterimText>
                  Listening<TypingDots>...</TypingDots>
                </InterimText>
              )}
            </CaptionBox>
          </CaptionOverlay>
        )}

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
