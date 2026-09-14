/**
 * Dark Killer - Signal Dashboard Application Entry Component
 * Features full VIP License/Password gating, hidden backend token logic,
 * Admin management portal (/admin), Wingo 30s Detail View, and Cyber AI Bot.
 */

import React, { useEffect, useState } from 'react';
import { MobileFrame } from './components/MobileFrame.tsx';
import { TopNavBar } from './components/TopNavBar.tsx';
import { ServerStatusBar } from './components/ServerStatusBar.tsx';
import { WingoPredictionSection } from './components/WingoPredictionSection.tsx';
import { VipSuitesSection } from './components/VipSuitesSection.tsx';
import { AllWinningTradersSection } from './components/AllWinningTradersSection.tsx';
import { Wingo30sDetailView } from './components/Wingo30sDetailView.tsx';
import { VipModelPredictionView } from './components/VipModelPredictionView.tsx';
import { ProTraderModal } from './components/ProTraderModal.tsx';
import { CyberBotWidget } from './components/CyberBotWidget.tsx';
import { SecurityLockOverlay } from './components/SecurityLockOverlay.tsx';
import { AdminPanel } from './components/AdminPanel.tsx';
import { tamperGuard } from './security/tamperGuard.ts';
import { sessionService } from './services/sessionService.ts';
import { signalService } from './services/signalService.ts';
import { systemService } from './services/systemService.ts';
import { vip24Service } from './services/vip24Service.ts';
import { licenseService } from './services/licenseService.ts';
import { clockEngine } from './engine/clockEngine.ts';
import { isSecretAdminTriggered, clearAdminSession } from './security/adminGate.ts';
import type { WingoSignal, SystemStatus, VipLogicModel } from './types/index.ts';

export default function App() {
  const [activeSignal, setActiveSignal] = useState<WingoSignal | null>(() => vip24Service.getTopSignal());
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [vipLogics, setVipLogics] = useState<VipLogicModel[]>(() => vip24Service.getCachedLogics());
  const [isWingoDetailOpen, setIsWingoDetailOpen] = useState(false);
  const [isProTraderOpen, setIsProTraderOpen] = useState(false);
  const [isBotChatOpen, setIsBotChatOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<VipLogicModel | null>(null);
  const [isSecurityLocked, setIsSecurityLocked] = useState(false);
  const [securityReason, setSecurityReason] = useState('');
  
  // VIP License / Password Gating State
  const [isUnlocked, setIsUnlocked] = useState(() => licenseService.getState().isUnlocked);
  const [isAdminOpen, setIsAdminOpen] = useState(() => isSecretAdminTriggered());

  const [countdown, setCountdown] = useState<number>(() => {
    const nowSec = Math.floor(Date.now() / 1000);
    const rem = 30 - (nowSec % 30);
    return rem === 30 ? 30 : rem;
  });

  // Load VIP 24 Logics directly from live API
  const loadVipLogics = async () => {
    try {
      const data = await vip24Service.getLogics();
      if (data && data.length > 0) {
        setVipLogics(data);
        const topSig = vip24Service.getTopSignal();
        if (topSig) {
          setActiveSignal(topSig);
        }
      }
    } catch (err) {
      console.warn('Could not refresh VIP logics:', err);
    }
  };

  useEffect(() => {
    // 1. Subscribe to License Service for reactive unlocks
    const unsubscribeLicense = licenseService.subscribe((state) => {
      setIsUnlocked(state.isUnlocked);
    });

    // 2. Subscribe to Tamper Guard & start anti-inspect defense
    const unsubscribeGuard = tamperGuard.subscribe((locked, reason) => {
      setIsSecurityLocked(locked);
      setSecurityReason(reason);
    });
    tamperGuard.start();

    // 3. Initialize or verify secure session with server
    sessionService.verifySession().catch(() => {
      // Handled silently
    });

    // 4. Synchronize server clock & system status
    const syncSystem = async () => {
      try {
        const status = await systemService.getStatus();
        setSystemStatus(status);
        if (status.utcTimestamp) {
          clockEngine.setServerOffset(status.utcTimestamp);
        }
      } catch {
        // Fallback to local clock
      }
    };
    syncSystem();

    // 5. Fetch active Wingo signal from backend proxy
    const loadSignal = async () => {
      try {
        const sig = await signalService.getActiveSignal();
        setActiveSignal(sig);
      } catch {
        // Handled silently
      }
    };
    loadSignal();
    const signalInterval = setInterval(loadSignal, 10000);

    // 6. Fetch VIP Logics with real-time fast polling (2 seconds)
    loadVipLogics();
    const vipInterval = setInterval(loadVipLogics, 2000);

    // 7. Listen for secret admin route triggers or URL changes
    const handleHashChange = () => {
      if (isSecretAdminTriggered()) {
        setIsAdminOpen(true);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);

    // 8. Listen for remote kick / password deletion auto-logout events
    const handleKicked = (e: Event) => {
      const customEvent = e as CustomEvent;
      const reason =
        customEvent.detail?.reason ||
        'পাসওয়ার্ড ডিলিট হওয়ায় বা অ্যাডমিন কর্তৃক আপনার ডিভাইস লগআউট করা হয়েছে।';
      setIsUnlocked(false);
      setIsSecurityLocked(true);
      setSecurityReason(reason);
    };
    window.addEventListener('dk_vip_kicked', handleKicked);

    return () => {
      unsubscribeLicense();
      unsubscribeGuard();
      clearInterval(signalInterval);
      clearInterval(vipInterval);
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
      window.removeEventListener('dk_vip_kicked', handleKicked);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const nowSec = Math.floor(Date.now() / 1000);
      const rem = 30 - (nowSec % 30);
      setCountdown(rem === 30 ? 30 : rem);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRequestUnlock = () => {
    setIsBotChatOpen(true);
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('bot-open-for-password'));
      const input = document.getElementById('bot-chat-mini-input');
      input?.focus();
    }, 50);
  };

  // Dedicated Admin Panel View
  if (isAdminOpen) {
    return (
      <AdminPanel
        onBackToApp={() => {
          setIsAdminOpen(false);
          clearAdminSession();
          window.location.hash = '';
          if (window.location.pathname !== '/') {
            window.history.replaceState(null, '', '/');
          }
        }}
      />
    );
  }

  return (
    <>
      {/* DevTools Intrusion Security Lockdown Overlay */}
      {isSecurityLocked && (
        <SecurityLockOverlay
          reason={securityReason}
          onDismissDevDemo={() => {
            tamperGuard.resetLock();
            setIsSecurityLocked(false);
          }}
          onReLogin={() => {
            setIsSecurityLocked(false);
            handleRequestUnlock();
          }}
        />
      )}

      {/* Direct 4K Vip Model Prediction View */}
      {selectedModel && (
        <VipModelPredictionView
          model={selectedModel}
          allModels={vipLogics}
          onBack={() => setSelectedModel(null)}
          onSelectModel={(m) => {
            if (!isUnlocked) {
              handleRequestUnlock();
              return;
            }
            setSelectedModel(m);
          }}
          onRefresh={loadVipLogics}
          isUnlocked={isUnlocked}
          onRequestUnlock={handleRequestUnlock}
        />
      )}

      {/* Wingo 30s Full Screen View (Exact match to uploaded user screenshot) */}
      {isWingoDetailOpen && (
        <Wingo30sDetailView
          logics={vipLogics}
          onBack={() => setIsWingoDetailOpen(false)}
          onRefresh={loadVipLogics}
          isUnlocked={isUnlocked}
          onRequestUnlock={handleRequestUnlock}
        />
      )}

      {/* Pro Trader VIP Modal */}
      <ProTraderModal
        isOpen={isProTraderOpen}
        onClose={() => setIsProTraderOpen(false)}
        models={vipLogics}
        countdown={countdown}
        isUnlocked={isUnlocked}
        onRequestUnlock={handleRequestUnlock}
        onSelectModel={(m) => {
          if (!isUnlocked) {
            handleRequestUnlock();
            return;
          }
          setSelectedModel(m);
        }}
      />

      {/* Main Mobile Frame Container matching exact HTML specification */}
      <MobileFrame>
        {/* Top App Navigation Bar */}
        <TopNavBar
          isUnlocked={isUnlocked}
          onRequestUnlock={handleRequestUnlock}
          onOpenAdmin={() => setIsAdminOpen(true)}
        />

        {/* Sub-header: Server Status & Digital Clock */}
        <ServerStatusBar
          serverStatusText={systemStatus?.status === 'ONLINE' ? 'LIVE SERVER' : 'LIVE SERVER'}
        />

        {/* Main Content Area */}
        <div className="flex-1 px-3.5 pt-4 pb-6 space-y-4">
          {/* Section: WINGO PREDICTION (Clicking opens the exact design from screenshot) */}
          <WingoPredictionSection
            activeSignal={activeSignal}
            onOpenWingoDetail={() => setIsWingoDetailOpen(true)}
          />

          {/* Section: VIP SUITES & AI with PRO TRADER */}
          <VipSuitesSection
            vipLogics={vipLogics}
            onOpenProTrader={() => setIsProTraderOpen(true)}
          />

          {/* Section: ALL WINNING TRADERS Leaderboards matching screenshot */}
          <AllWinningTradersSection
            models={vipLogics}
            countdown={countdown}
            isUnlocked={isUnlocked}
            onRequestUnlock={handleRequestUnlock}
            onSelectModel={(m) => {
              if (!isUnlocked) {
                handleRequestUnlock();
                return;
              }
              setSelectedModel(m);
            }}
          />
        </div>
      </MobileFrame>

      {/* Interactive 2D Cybernetic AI Robot Bot with in-place chat and minimize */}
      <CyberBotWidget
        activeModel={selectedModel}
        allModels={vipLogics}
        countdown={countdown}
        isOpen={isBotChatOpen}
        onOpenChat={() => setIsBotChatOpen(true)}
        onToggleChat={() => setIsBotChatOpen((prev) => !prev)}
        onCloseChat={() => setIsBotChatOpen(false)}
      />
    </>
  );
}
