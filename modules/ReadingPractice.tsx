import { GoogleGenAI, LiveSession, Blob, LiveServerMessage, Modality } from '@google/genai';
import React, { useState, useRef, useEffect } from 'react';

// Initialize AI instance once. Explicitly handle the case where the API key is missing.
const ai = process.env.API_KEY ? new GoogleGenAI({ apiKey: process.env.API_KEY }) : null;

// --- Audio Helper Functions ---

function encode(bytes: Uint8Array): string {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function createBlob(data: Float32Array): Blob {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        int16[i] = data[i] * 32768;
    }
    return {
        data: encode(new Uint8Array(int16.buffer)),
        mimeType: 'audio/pcm;rate=16000',
    };
}


const ReadingPractice: React.FC = () => {
    const [isConnecting, setIsConnecting] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [userTranscription, setUserTranscription] = useState('');
    const [currentModelFeedback, setCurrentModelFeedback] = useState('');
    const [status, setStatus] = useState('Siap untuk memulai latihan.');

    // Refs to manage live resources
    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const nextStartTimeRef = useRef<number>(0);
    
    // Use a ref to get the latest recording state in callbacks, preventing stale closures.
    const isRecordingRef = useRef(isRecording);
    useEffect(() => {
        isRecordingRef.current = isRecording;
    }, [isRecording]);

    // Fix: Define isConnectingRef and keep it in sync with isConnecting state to avoid stale closures and fix "Cannot find name" errors.
    const isConnectingRef = useRef(isConnecting);
    useEffect(() => {
        isConnectingRef.current = isConnecting;
    }, [isConnecting]);

    // Centralized cleanup function to ensure all resources are released properly.
    const cleanupResources = () => {
        streamRef.current?.getTracks().forEach(track => track.stop());
        scriptProcessorRef.current?.disconnect();
        sourceNodeRef.current?.disconnect();

        // Close audio contexts if they exist
        inputAudioContextRef.current?.close().catch(console.error);
        outputAudioContextRef.current?.close().catch(console.error);

        // Close the AI session
        sessionPromiseRef.current?.then(session => session.close()).catch(console.error);

        // Stop any playing audio
        audioSourcesRef.current.forEach(source => source.stop());
        audioSourcesRef.current.clear();

        // Reset all refs to their initial state
        streamRef.current = null;
        scriptProcessorRef.current = null;
        sourceNodeRef.current = null;
        inputAudioContextRef.current = null;
        outputAudioContextRef.current = null;
        sessionPromiseRef.current = null;
        nextStartTimeRef.current = 0;
    };

    const stopRecording = () => {
        if (!isRecordingRef.current) return;
        setIsRecording(false);
        setIsConnecting(false);
        setStatus('Latihan selesai. Anda dapat memulai lagi.');
        cleanupResources();
    };
    
    const startRecording = async () => {
        if (isRecordingRef.current || isConnecting) return;

        // Crucial Check: Ensure the AI instance is available.
        if (!ai) {
            setStatus("Koneksi gagal: Kunci API Google AI tidak dikonfigurasi.");
            console.error("GoogleGenAI instance is not available. Check your API_KEY.");
            return;
        }

        setIsConnecting(true);
        setUserTranscription('');
        setCurrentModelFeedback('');
        setStatus('Meminta izin mikrofon...');
            
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            setStatus('Menghubungkan ke server AI...');

            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
                    },
                    systemInstruction: 'Anda adalah seorang pelatih membaca kitab (Qira\'ah) yang ramah. Pengguna akan membaca dalam Bahasa Arab. Tugas Anda adalah memberikan semua instruksi dan umpan balik utama dalam **Bahasa Indonesia**. Dengarkan bacaan pengguna, lalu berikan komentar tentang kelancaran dan pengucapan (makhraj). Anda bisa memulai sesi dengan sapaan seperti "Assalamualaikum, mari kita mulai." dan gunakan frasa Arab singkat untuk memberi semangat, seperti "ممتاز" (Mumtaz) atau "أحسنت" (Ahsant), tapi pastikan inti penjelasan tetap dalam Bahasa Indonesia.',
                },
                callbacks: {
                    onopen: () => {
                        // Prevent setup if user has already cancelled
                        if (!isConnectingRef.current) return; 

                        setIsConnecting(false);
                        setIsRecording(true);
                        setStatus('Mendengarkan... Silakan mulai berbicara dalam bahasa Arab.');
                        
                        inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                        outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

                        sourceNodeRef.current = inputAudioContextRef.current.createMediaStreamSource(stream);
                        scriptProcessorRef.current = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);

                        scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob = createBlob(inputData);
                            
                            sessionPromise.then((session) => {
                                // Only send data if still recording
                                if (isRecordingRef.current) {
                                   session.sendRealtimeInput({ media: pcmBlob });
                                }
                            }).catch(err => {
                                console.error("Error sending audio data:", err);
                                setStatus('Kesalahan koneksi saat mengirim audio.');
                                stopRecording();
                            });
                        };
                        sourceNodeRef.current.connect(scriptProcessorRef.current);
                        scriptProcessorRef.current.connect(inputAudioContextRef.current.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                         if (message.serverContent?.inputTranscription) {
                            setUserTranscription(prev => prev + message.serverContent.inputTranscription.text);
                        }
                        if (message.serverContent?.outputTranscription) {
                            setCurrentModelFeedback(prev => prev + message.serverContent.outputTranscription.text);
                        }
                        
                        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        const outputCtx = outputAudioContextRef.current;
                        if(base64Audio && outputCtx) {
                            try {
                                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
                                const audioBuffer = await decodeAudioData(decode(base64Audio), outputCtx, 24000, 1);
                                const source = outputCtx.createBufferSource();
                                source.buffer = audioBuffer;
                                source.connect(outputCtx.destination);
                                source.addEventListener('ended', () => audioSourcesRef.current.delete(source));
                                source.start(nextStartTimeRef.current);
                                nextStartTimeRef.current += audioBuffer.duration;
                                audioSourcesRef.current.add(source);
                            } catch (err) {
                                console.error("Error playing back audio:", err);
                            }
                        }

                        if (message.serverContent?.turnComplete) {
                            setCurrentModelFeedback(prev => prev + '\n');
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Live session error:', e);
                        setStatus(`Terjadi kesalahan koneksi: ${e.message || 'Error tidak diketahui'}`);
                        stopRecording();
                    },
                    onclose: (e: CloseEvent) => {
                         // Only show message if the session was active and closed unexpectedly
                         if (isRecordingRef.current) {
                            setStatus(`Koneksi ditutup (code: ${e.code}). Silakan mulai lagi.`);
                            stopRecording();
                         }
                    },
                }
            });

            sessionPromiseRef.current = sessionPromise;
            // Handle connection failure
            sessionPromise.catch(err => {
                console.error("Failed to connect to live session:", err);
                if (isConnectingRef.current) {
                    setStatus("Gagal terhubung ke server AI. Coba lagi.");
                    setIsConnecting(false);
                    cleanupResources();
                }
            });

        } catch (error) {
            console.error('Error starting recording:', error);
            setStatus('Gagal mengakses mikrofon. Pastikan Anda telah memberikan izin.');
            setIsConnecting(false);
            setIsRecording(false);
        }
    };
    
    // Ensure cleanup happens when the component is unmounted.
    useEffect(() => {
        return () => {
            // Fix: Use the component-level ref to signal cancellation to any pending onopen callbacks.
            isConnectingRef.current = false; // Prevent onopen from firing after unmount
            cleanupResources();
        }
    }, []);

    const isDisabled = isConnecting;
    const currentAction = isRecording ? stopRecording : startRecording;
    const buttonClass = isRecording 
        ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
        : (isConnecting ? 'bg-amber-500 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700');

    return (
        <div className="h-full flex flex-col items-center justify-center text-center animate-fade-in p-4">
            <header className="mb-8">
                <h2 className="text-3xl font-bold text-teal-900">Latihan Qira'ah</h2>
                <p className="text-lg text-stone-600 mt-1">Uji kemampuan membaca Anda dengan umpan balik AI real-time.</p>
            </header>

            <button
                onClick={currentAction}
                disabled={isDisabled}
                className={`w-40 h-40 md:w-48 md:h-48 rounded-full flex items-center justify-center text-white transition-all duration-300 shadow-xl ${buttonClass}`}
            >
                <div className="text-center">
                    <i className={`fa-solid ${isRecording ? 'fa-stop' : (isConnecting ? 'fa-spinner fa-spin' : 'fa-microphone')} text-4xl md:text-5xl`}></i>
                    <p className="mt-4 font-bold text-lg md:text-xl">{isRecording ? 'Berhenti' : (isConnecting ? 'Menghub...' : 'Mulai')}</p>
                </div>
            </button>

            <p className="mt-6 text-stone-700 font-semibold h-6">{status}</p>

            <div className="mt-8 w-full max-w-3xl bg-white p-6 rounded-lg shadow-inner min-h-[250px] flex flex-col gap-4">
                <div>
                    <h3 className="font-bold text-lg text-left text-teal-800 mb-2">Bacaan Anda (Transkripsi):</h3>
                    <p dir="rtl" className="text-right text-2xl text-stone-800 font-serif leading-loose min-h-[60px] p-2 bg-stone-50 rounded-md">
                        {userTranscription || "..."}
                    </p>
                </div>
                <div className="border-t pt-4">
                    <h3 className="font-bold text-lg text-left text-teal-800 mb-2">Umpan Balik Pelatih:</h3>
                    <p className="text-left text-lg text-stone-700 whitespace-pre-wrap leading-relaxed min-h-[60px]">
                        {currentModelFeedback || "..."}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ReadingPractice;