import React, { useState, useEffect, useRef } from "react";
import Spline from "@splinetool/react-spline";
import styled from "styled-components";
import { tryParseDefiIntent, askGeneralAgent } from "../api/sarvamAgent.js";
import { HeroDesign } from "../components/home/HeroDesign.jsx";

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
    props.isListening ? "#ef4444" : "var(--color-primary)"};
  color: blue;
  border: none;
  border-radius: 50px;
  padding: 1%;
  font-size: 2rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;
  box-shadow: ${(props) =>
    props.isListening
      ? "0 0 30px rgba(239, 68, 68, 0.6)"
      : "0 0 30px rgba(var(--color-primary-rgb), 0.6)"};
`;

export default function SpectraSupport() {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef(null);

  const speak = (text) => {
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
  };

  useEffect(() => {
    const greet = () => speak("Welcome to Spectra, How may I assist you?");
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = greet;
    } else {
      greet();
    }

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

    try {
      const result = await tryParseDefiIntent(text);
      let responseText = "";

      if (result && !result.error) {
        const { action, amount, token } = result;
        if (action?.toLowerCase() === "bridge") {
          responseText = `I can help you bridge ${amount} ${token}. Head over to the Agent OS terminal to sign the transaction.`;
        } else {
          responseText = `I am ready to help you ${action} ${amount || "some"} ${token}. You can execute this in the Agent OS terminal.`;
        }
      } else {
        const generalResponse = await askGeneralAgent(text);
        if (generalResponse) {
          responseText = generalResponse;
        } else {
          responseText =
            result?.error || "I'm sorry, I couldn't understand that request.";
        }
      }

      speak(responseText);
    } catch (err) {
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
            isListening={isListening}
            disabled={isProcessing}
          >
            <span className="material-symbols-outlined">
              {isListening ? "mic_off" : "mic"}
            </span>
            {isListening ? "STOP LISTENING" : isProcessing ? "THINKING..." : ""}
          </MicButton>
        </UIOverlay>
      </Container>
    </div>
  );
}
