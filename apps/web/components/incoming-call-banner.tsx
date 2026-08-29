'use client';

import React, { useEffect, useState } from 'react';
import { getSocket } from '../lib/socketClient';
import { Video, PhoneCall, X } from 'lucide-react';

export function IncomingCallBanner() {
  const [callData, setCallData] = useState<any>(null);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleIncomingCall = (data: any) => {
      console.log('Incoming call received:', data);
      setCallData(data);
    };

    socket.on('incoming_video_call', handleIncomingCall);

    return () => {
      socket.off('incoming_video_call', handleIncomingCall);
    };
  }, []);

  if (!callData) return null;

  const handleAcceptCall = () => {
    let url = callData.meetingUrl || '';

    // Guarantee prejoin, lobby, mobile deep linking bypass, chat icon in toolbar, and clean camera toggling
    if (url.includes('meet.ffmuc.net')) {
      url = url.replace('meet.ffmuc.net', 'jitsi.riot.im');
    }

    if (url.includes('jitsi.riot.im') || url.includes('meet.jit.si')) {
      const baseUrl = url.split('#')[0];
      url = `${baseUrl}#config.prejoinPageEnabled=false&config.enableLobby=false&config.requireDisplayName=false&config.disableDeepLinking=true&config.disableSelfView=false&config.doNotFlipLocalVideo=false&config.chat={"position":"right"}&config.participantsPane={"enabled":true}&config.toolbarButtons=["microphone","camera","desktop","chat","raisehand","participants-pane","tileview","fullscreen","hangup"]`;
    }

    window.open(url, '_blank');
    setCallData(null);
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-lg w-full px-4 animate-in slide-in-from-top duration-300">
      <div className="glass-panel p-4 rounded-2xl border-2 border-emerald-500 bg-slate-900/95 text-white shadow-2xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 animate-bounce">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-white flex items-center gap-1.5">
              <Video className="w-4 h-4 text-emerald-400" /> Incoming Live Video Call!
            </h4>
            <p className="text-xs font-semibold text-slate-200">
              {callData.callerName} is calling for "{callData.sessionTitle}"
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAcceptCall}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg flex items-center gap-1.5 transition-all transform active:scale-95"
          >
            <Video className="w-4 h-4" /> Join Call
          </button>
          <button
            onClick={() => setCallData(null)}
            className="p-2 rounded-xl bg-surface border border-surfaceBorder text-slate-400 hover:text-white"
            title="Dismiss call alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
