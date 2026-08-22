import Vapi from "@vapi-ai/web";
import { useEffect, useState } from "react";
import {
  vapiSecretsAtom,
  widgetSettingsAtom,
  organizationIdAtom,
} from "../atoms/widget-atoms";
import { useAtomValue } from "jotai";

interface TranscriptMessage {
  role: "user" | "assistant";
  text: string;
}

export const useVapi = () => {
  const vapiSecrets = useAtomValue(vapiSecretsAtom);
  const widgetSettings = useAtomValue(widgetSettingsAtom);
  const organizationId = useAtomValue(organizationIdAtom);

  const [vapi, setVapi] = useState<Vapi | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);

  useEffect(() => {
    if (!vapiSecrets) {
      return;
    }

    const vapiInstance = new Vapi(vapiSecrets.publicApiKey);
    setVapi(vapiInstance);

    vapiInstance.on("call-start", () => {
      setIsConnected(true);
      setIsConnecting(true);
      setTranscript([]);
    });

    vapiInstance.on("call-end", () => {
      setIsConnected(false);
      setIsConnecting(false);
      setIsSpeaking(false);
    });

    vapiInstance.on("speech-start", () => {
      setIsSpeaking(true);
    });

    vapiInstance.on("speech-end", () => {
      setIsSpeaking(false);
    });

    vapiInstance.on("error", () => {
      setIsConnecting(false);
    });

    vapiInstance.on("message", (message) => {
      if (
        message.type === "transcript" &&
        message.transcriptType === "final"
      ) {
        setTranscript((prev) => [
          ...prev,
          {
            role: message.sender === "user" ? "user" : "assistant",
            text: message.text,
          },
        ]);
      }
    });

    return () => {
      vapiInstance.stop();
    };
  }, [vapiSecrets]);

  const startCall = () => {
    if (
      !vapiSecrets ||
      !organizationId ||
      !widgetSettings?.vapiSettings?.assistantId
    ) {
      return;
    }

    setIsConnecting(true);

    if (vapi) {
      vapi.start(widgetSettings.vapiSettings.assistantId, {
          variableValues: {
            organizationId,
          },
      });
    }
  };

  const endCall = () => {
    if (vapi) {
      vapi.stop();
    }
  };

  return {
    isSpeaking,
    isConnecting,
    isConnected,
    transcript,
    startCall,
    endCall,
  };
};