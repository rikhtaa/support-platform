import Vapi from '@vapi-ai/web'
import { error } from 'node:console'
import { useEffect, useState } from 'react'

interface TranscriptMessage {
    role: "user" | "assistant"
    text: string
}

export const useVapi = () => {
    const [vapi, setVapi] = useState<Vapi | null>(null)
    const [isConnected, setIsConnected] = useState(false)
    const [isConnecting, setIsConnecting] = useState(false)
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [transcript, setTranscript] = useState<TranscriptMessage[]>([])

    useEffect(()=> {
        //only for testing the vapi API, otherwise customers will provide their own API keys
        const vapiInstance = new Vapi("39921c0d-8e3f-48a6-bb66-0ad81d8675d6")
        setVapi(vapiInstance)
        
        vapiInstance.on("call-start", ()=>{
            setIsConnected(true)
            setIsConnecting(true)
            setTranscript([])
        })

        vapiInstance.on("call-end", ()=>{
            setIsConnected(false)
            setIsConnecting(false)
            setIsSpeaking(false)
        })

        vapiInstance.on("speech-start", ()=>{
            setIsSpeaking(true)
        })

        vapiInstance.on("speech-end", ()=>{
            setIsSpeaking(false)
        })

        vapiInstance.on("error", (error) => {
          console.log(error, "Vapi_Error")
            setIsConnecting(false)
          
        })

        vapiInstance.on("message", (message)=>{
            if(message.type === "transcript" && message.transcriptType === 'final'){
            setTranscript(prev => [
                ...prev, 
                {
                role: message.sender === "user" ? "user" : "assistant",
                text: message.text
            }
           ])
          }
        })

        return () => {
            vapiInstance.stop()
        }
    }, [])
    
    const startCall = () => {
        setIsConnecting(true)

        if(vapi){
            //only for testing the vapi API, otherwise customers will provide their own Assistant ID
            vapi.start("aafbb2de-1eb0-417d-95f6-69b89d91ec0f")
        }
    }

    const endCall = () => {    
     if(vapi){
        vapi.stop()
     }
    }

    return {
        isSpeaking,
        isConnecting,       
        isConnected,
        transcript,
        startCall,
        endCall
    }
}