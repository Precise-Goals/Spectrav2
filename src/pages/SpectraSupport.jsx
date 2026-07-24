import React, { useState, useEffect, useRef, useCallback } from "react";
import Spline from "@splinetool/react-spline";
import styled, { keyframes } from "styled-components";
import { askGeneralAgent } from "../api/sarvamAgent.js";
import { HeroDesign } from "../components/layout/Agnt.jsx";
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
  bottom: 20%;
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

const slideIn = keyframes`
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const SidePanel = styled.div`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 300px;
  max-height: 60%;
  background: rgba(15, 15, 20, 0.45);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 28px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
  pointer-events: auto;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1);
  z-index: 10;
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 4px;
  }
`;

const LeftPanel = styled(SidePanel)`
  left: 20%;
  top: 40%;
`;

const RightPanel = styled(SidePanel)`
  right: 20%;
  top:60%;
`;

const PanelHeader = styled.div`
  font-family: 'Geist', monospace;
  font-size: 10px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 4px;
  text-align: ${(props) => props.$align || 'left'};
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding-bottom: 12px;
`;

const MessageBubble = styled.div`
  background: ${(props) => props.$role === 'user' ? 'rgba(96, 165, 250, 0.12)' : 'rgba(176, 38, 255, 0.12)'};
  border: 1px solid ${(props) => props.$role === 'user' ? 'rgba(96, 165, 250, 0.25)' : 'rgba(176, 38, 255, 0.25)'};
  color: rgba(255, 255, 255, 0.9);
  padding: 14px 18px;
  border-radius: 20px;
  font-family: 'Geist', sans-serif;
  font-size: 13px;
  line-height: 1.6;
  align-self: ${(props) => props.$role === 'user' ? 'flex-end' : 'flex-start'};
  max-width: 92%;
  animation: ${slideIn} 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  opacity: 0;
  transform: translateY(12px);
`;

export default function SpectraSupport() {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatLog, setChatLog] = useState([]);
  const recognitionRef = useRef(null);
  const leftPanelRef = useRef(null);
  const rightPanelRef = useRef(null);

  // Auto-scroll to bottom of logs
  useEffect(() => {
    if (leftPanelRef.current) {
      leftPanelRef.current.scrollTop = leftPanelRef.current.scrollHeight;
    }
    if (rightPanelRef.current) {
      rightPanelRef.current.scrollTop = rightPanelRef.current.scrollHeight;
    }
  }, [chatLog]);

  const speak = async (text) => {

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

      let networkRetryCount = 0;

      recognitionRef.current.onresult = async (event) => {
        networkRetryCount = 0; // Reset on success
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

        if (final) {
          console.log("[Spectra STT] User heard:", final);
          setChatLog(prev => [...prev, { role: 'user', text: final }]);
          setIsListening(false);
          await processInput(final);
        }
      };

      recognitionRef.current.onerror = (event) => {
        if (event.error !== 'network') {
          console.warn("Speech recognition error:", event.error);
        }
        
        if (event.error === 'network') {
          if (networkRetryCount < 3) {
            networkRetryCount++;
            console.warn(`Speech network error, retrying (${networkRetryCount}/3)...`);
            try {
              recognitionRef.current.stop();
              setTimeout(() => {
                recognitionRef.current?.start();
              }, 200);
            } catch (e) {
              console.warn("Failed to restart speech recognition:", e);
            }
            return; // Don't stop listening state
          }
          console.warn("Speech recognition disconnected (Network).");
        } else if (event.error === 'not-allowed') {
          console.warn("Microphone access denied. Please allow microphone permissions in your browser.");
        } else {
          console.warn(`Microphone error: ${event.error}`);
        }

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
      setChatLog(prev => [...prev, { role: 'agent', text: responseText }]);
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
          <div className="blue">  </div>
          <div className="prpl">  </div>
      <Container className="bg-grid-overlay">
        <div className="spectraai">
          <HeroDesign />
        </div>

        {/* Left Panel: Agent Log */}
        <LeftPanel ref={leftPanelRef}>
          <PanelHeader>✦ Agent Logs</PanelHeader>
          {chatLog.filter(m => m.role === 'agent').map((m, i) => (
            <MessageBubble key={`agent-${i}`} $role="agent">
              {m.text}
            </MessageBubble>
          ))}
        </LeftPanel>

        {/* Right Panel: User Log */}
        <RightPanel ref={rightPanelRef}>
          <PanelHeader $align="right">User Queries 🎤</PanelHeader>
          {chatLog.filter(m => m.role === 'user').map((m, i) => (
            <MessageBubble key={`user-${i}`} $role="user">
              {m.text}
            </MessageBubble>
          ))}
        </RightPanel>

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
