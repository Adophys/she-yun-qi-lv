import React, { useState, useRef } from 'react';
import { UserProfile } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Wifi, Sparkles, MapPin, Camera, RefreshCw, CheckCircle, Zap, ShieldCheck } from 'lucide-react';
import { soundManager } from '../utils/audio';
import confetti from 'canvas-confetti';

interface ScanViewProps {
  user: UserProfile;
  onUnlockReward: (reward: { points: number; fragmentName: string; archiveName: string }) => void;
  onOpenDetail: (id: string) => void;
}

export const ScanView: React.FC<ScanViewProps> = ({ user, onUnlockReward, onOpenDetail }) => {
  const [scanMode, setScanMode] = useState<'nfc' | 'ar'>('nfc');
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Trigger NFC Touch Scan Simulation
  const handleStartNFCScan = () => {
    soundManager.playTap();
    setIsScanning(true);
    setScanSuccess(false);

    setTimeout(() => {
      soundManager.playNFCSuccess();
      setIsScanning(false);
      setScanSuccess(true);
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
      });

      onUnlockReward({
        points: 100,
        fragmentName: '凤凰华服碎片 (+1)',
        archiveName: '畲族银饰锻造技艺 (已收录)',
      });
    }, 1800);
  };

  // Toggle Camera AR
  const handleToggleCamera = async () => {
    soundManager.playTap();
    if (cameraActive) {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
      setCameraActive(false);
      return;
    }

    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err) {
      setCameraError('未获取到摄像头权限或设备暂不支持AR，已启用模拟扫描。');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto pb-24 px-4 pt-3 select-none">
      {/* Mode Switcher Tabs */}
      <div className="flex justify-center mb-4">
        <div className="flex p-1 bg-slate-200/80 rounded-xl">
          <button
            id="scan-tab-nfc"
            onClick={() => {
              soundManager.playTap();
              setScanMode('nfc');
            }}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              scanMode === 'nfc' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            NFC 碰一碰
          </button>
          <button
            id="scan-tab-ar"
            onClick={() => {
              soundManager.playTap();
              setScanMode('ar');
            }}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              scanMode === 'ar' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>实景 AR 扫描</span>
          </button>
        </div>
      </div>

      {scanMode === 'nfc' ? (
        <div className="flex flex-col items-center">
          {/* Top She Geometric Totem Icon (Image 11) */}
          <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-md mb-3 border border-slate-700">
            <svg width="28" height="28" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="6" y="6" width="28" height="28" rx="4" stroke="currentColor" strokeWidth="3" />
              <rect x="13" y="13" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="3" />
              <rect x="18" y="18" width="4" height="4" fill="currentColor" />
            </svg>
          </div>

          {/* Headline & Subtitle */}
          <h2 className="text-2xl font-black text-slate-900 tracking-tight text-center font-serif">
            碰一碰，开启隐藏记忆
          </h2>
          <p className="text-xs text-slate-500 text-center max-w-xs mt-2 leading-relaxed">
            将手机靠近NFC文化卡，解锁隐藏故事、限定皮肤及AR内容。
          </p>

          {/* Graphic: 3D Phone Hovering over NFC Cultural Card (Image 11) */}
          <div className="relative w-full max-w-[280px] h-[280px] my-6 flex items-center justify-center">
            {/* Background NFC Card */}
            <div className="absolute w-44 h-64 bg-[#0a192f] rounded-2xl border-2 border-slate-700/60 shadow-xl transform -rotate-12 translate-x-3 translate-y-2 p-3 text-white flex flex-col justify-between overflow-hidden">
              <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono tracking-widest">
                <span>ARTIFACT NFC</span>
                <Sparkles className="w-3 h-3 text-amber-400" />
              </div>
              <div className="flex flex-col items-center py-4">
                <div className="w-14 h-14 rounded-full border border-teal-500/30 flex items-center justify-center">
                  <Wifi className="w-7 h-7 text-teal-400 rotate-90" />
                </div>
                <span className="text-[10px] font-bold mt-2 text-teal-300">景宁非遗实体卡 #088</span>
              </div>
              <div className="text-[9px] text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-teal-400" />
                <span>非遗正品防伪认证</span>
              </div>
            </div>

            {/* Foreground 3D Smartphone */}
            <motion.div
              animate={
                isScanning
                  ? {
                      y: [0, -15, 0],
                      scale: [1, 1.03, 1],
                      rotate: [6, 4, 6],
                    }
                  : {
                      y: [-4, 4, -4],
                      rotate: [6, 6, 6],
                    }
              }
              transition={{ duration: isScanning ? 0.8 : 3, repeat: Infinity, ease: 'easeInOut' }}
              className="relative z-10 w-44 h-64 bg-white rounded-3xl border-4 border-slate-300 shadow-2xl p-3 flex flex-col items-center justify-between"
            >
              {/* Phone speaker */}
              <div className="w-10 h-1 bg-slate-300 rounded-full" />

              {/* Sensor graphic inside screen */}
              <div className="flex flex-col items-center justify-center my-auto">
                <motion.div
                  animate={{
                    scale: [1, 1.25, 1],
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                  className="w-16 h-16 rounded-full bg-teal-50 border-2 border-teal-500/80 flex items-center justify-center text-teal-600 relative shadow-inner"
                >
                  <Wifi className="w-8 h-8 rotate-90" />
                  {isScanning && (
                    <span className="absolute inset-0 rounded-full border-2 border-red-500 animate-ping opacity-75" />
                  )}
                </motion.div>
                <p className="text-[11px] font-bold text-slate-700 mt-3 tracking-tight">
                  {isScanning ? '正在感应文化卡...' : '请靠近感应区域'}
                </p>
              </div>

              {/* Bottom bar */}
              <div className="w-12 h-1 bg-slate-300 rounded-full" />
            </motion.div>
          </div>

          {/* Immediate Sensory Trigger Button (Image 11) */}
          <div className="w-full max-w-xs">
            <button
              id="btn-nfc-immediate-sense"
              onClick={handleStartNFCScan}
              disabled={isScanning}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#991b1b] to-[#dc2626] hover:from-[#7f1d1d] hover:to-[#b91c1c] text-white font-bold text-sm shadow-md shadow-red-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>感应读取中...</span>
                </>
              ) : (
                <>
                  <Wifi className="w-4 h-4 rotate-90" />
                  <span>立即感应</span>
                </>
              )}
            </button>
          </div>

          {/* Success Notification Banner */}
          <AnimatePresence>
            {scanSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center justify-between gap-2 max-w-xs w-full shadow-xs"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>感应成功！获得 +100 积分与凤凰装碎片</span>
                </div>
                <button
                  onClick={() => onOpenDetail('c-1')}
                  className="text-emerald-700 font-bold underline shrink-0"
                >
                  查看
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        /* AR Camera Mode */
        <div className="flex flex-col items-center">
          <div className="w-full max-w-sm h-80 bg-slate-900 rounded-3xl overflow-hidden relative border-4 border-slate-800 shadow-xl flex items-center justify-center">
            {cameraActive ? (
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            ) : (
              <div className="p-6 text-center text-slate-400">
                <Camera className="w-12 h-12 mx-auto mb-2 text-slate-600" />
                <p className="text-xs">开启相机扫描周围的畲族非遗实物或展板</p>
              </div>
            )}

            {/* AR Reticle / Scanner Overlay */}
            <div className="absolute inset-8 border-2 border-dashed border-teal-400/80 rounded-2xl pointer-events-none flex flex-col justify-between p-2">
              <div className="flex justify-between">
                <div className="w-4 h-4 border-t-2 border-l-2 border-teal-400" />
                <div className="w-4 h-4 border-t-2 border-r-2 border-teal-400" />
              </div>
              <div className="text-center">
                <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] text-teal-300 font-mono">
                  AR 图腾识别中...
                </span>
              </div>
              <div className="flex justify-between">
                <div className="w-4 h-4 border-b-2 border-l-2 border-teal-400" />
                <div className="w-4 h-4 border-b-2 border-r-2 border-teal-400" />
              </div>
            </div>
          </div>

          {cameraError && <p className="text-xs text-amber-600 mt-2 text-center">{cameraError}</p>}

          <div className="mt-4 flex gap-3">
            <button
              id="btn-toggle-camera"
              onClick={handleToggleCamera}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-all shadow-sm"
            >
              <Camera className="w-4 h-4" />
              <span>{cameraActive ? '关闭相机' : '启动摄像头'}</span>
            </button>
            <button
              id="btn-sim-ar-identify"
              onClick={handleStartNFCScan}
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-all shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>识别当前目标</span>
            </button>
          </div>
        </div>
      )}

      {/* Info Card: 哪里可以获得文化卡？ (Image 11) */}
      <div className="mt-6 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5">
          <MapPin className="w-4 h-4 text-cyan-300" />
        </div>
        <div className="text-xs text-slate-600 leading-relaxed">
          <h4 className="font-bold text-slate-800 mb-0.5">哪里可以获得文化卡？</h4>
          <p>您可以在畲族文化博物馆、非遗快闪活动或特定村落打卡点获得专属NFC实体卡。</p>
        </div>
      </div>
    </div>
  );
};
