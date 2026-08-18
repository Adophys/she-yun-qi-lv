import React, { useState } from 'react';
import {
  initialUserProfile,
  initialWardrobeItems,
  initialCulturalItems,
  initialExploreNodes,
  initialBadges,
} from './data/mockData';
import {
  CulturalItem,
  ExploreNode,
  ScreenType,
  TabType,
  UserProfile,
  WardrobeItem,
} from './types';
import { TopBar } from './components/TopBar';
import { BottomNavBar } from './components/BottomNavBar';
import { VillageView } from './components/VillageView';
import { ExploreView } from './components/ExploreView';
import { ScanView } from './components/ScanView';
import { CollectionView } from './components/CollectionView';
import { ProfileView } from './components/ProfileView';
import { WardrobeView } from './components/WardrobeView';
import { PuzzleGameView } from './components/PuzzleGameView';
import { ChallengeSuccessModal } from './components/ChallengeSuccessModal';
import { ItemDetailModal } from './components/ItemDetailModal';
import { SettingsView } from './components/SettingsView';
import { TermsView } from './components/TermsView';
import { LoginView } from './components/LoginView';
import { FeedbackModal } from './components/FeedbackModal';

export default function App() {
  // Global State
  const [user, setUser] = useState<UserProfile>(initialUserProfile);
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>(initialWardrobeItems);
  const [culturalItems, setCulturalItems] = useState<CulturalItem[]>(initialCulturalItems);
  const [exploreNodes, setExploreNodes] = useState<ExploreNode[]>(initialExploreNodes);
  const [badges, setBadges] = useState(initialBadges);

  // Navigation State
  const [activeTab, setActiveTab] = useState<TabType>('village');
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('main');
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  // Modals
  const [selectedItem, setSelectedItem] = useState<CulturalItem | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [activeChallengeNode, setActiveChallengeNode] = useState<ExploreNode | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // Points & Level Helper
  const handleUpdatePoints = (pointsDelta: number) => {
    setUser((prev) => {
      const newPoints = Math.max(0, prev.points + pointsDelta);
      const newLevel = Math.floor(newPoints / 250) + 1;
      return {
        ...prev,
        points: newPoints,
        level: Math.max(prev.level, newLevel),
      };
    });
  };

  // Wardrobe Equip Handlers
  const handleEquipItem = (itemId: string) => {
    setWardrobeItems((prev) => {
      const target = prev.find((i) => i.id === itemId);
      if (!target || target.isLocked) return prev;

      return prev.map((item) => {
        if (item.category === target.category) {
          return {
            ...item,
            isEquipped: item.id === itemId ? !item.isEquipped : false,
          };
        }
        return item;
      });
    });
  };

  const handleCraftFragment = (itemId: string) => {
    if (user.points < 50) return;
    handleUpdatePoints(-50);

    setWardrobeItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const nextFragments = item.fragments + 1;
          const isNowUnlocked = nextFragments >= item.totalFragments;
          return {
            ...item,
            fragments: nextFragments,
            isLocked: isNowUnlocked ? false : item.isLocked,
          };
        }
        return item;
      })
    );
  };

  // Exploration & Puzzle Handlers
  const handleStartChallenge = (node: ExploreNode) => {
    if (node.status === 'locked') return;
    setActiveChallengeNode(node);
    setCurrentScreen('puzzle');
  };

  const handlePuzzleSuccess = () => {
    setCurrentScreen('main');
    setShowSuccessModal(true);

    if (activeChallengeNode) {
      // Mark node completed and unlock next node
      setExploreNodes((prev) => {
        const nextNodes = prev.map((n) => {
          if (n.id === activeChallengeNode.id) {
            return { ...n, status: 'completed' as const, stars: 3 };
          }
          return n;
        });

        const currentIndex = nextNodes.findIndex((n) => n.id === activeChallengeNode.id);
        if (currentIndex !== -1 && currentIndex + 1 < nextNodes.length) {
          if (nextNodes[currentIndex + 1].status === 'locked') {
            nextNodes[currentIndex + 1].status = 'active';
          }
        }
        return nextNodes;
      });

      // Update User Stats
      handleUpdatePoints(100);
      setUser((prev) => ({
        ...prev,
        completedStages: Math.min(prev.totalStages, prev.completedStages + 1),
      }));

      // Unlock a wardrobe fragment
      setWardrobeItems((prev) =>
        prev.map((w) => (w.id === 'w-1' ? { ...w, fragments: Math.min(w.totalFragments, w.fragments + 1) } : w))
      );
    }
  };

  const handleNextLevelFromSuccess = () => {
    setShowSuccessModal(false);
    setActiveTab('explore');
  };

  // Scan Reward Handler
  const handleUnlockReward = ({
    points,
    fragmentName,
  }: {
    points: number;
    fragmentName: string;
    archiveName: string;
  }) => {
    handleUpdatePoints(points);
    setUser((prev) => ({
      ...prev,
      arDiscovered: prev.arDiscovered + 1,
      collectedCards: Math.min(prev.totalCards, prev.collectedCards + 1),
    }));

    // Unlock card in collection
    setCulturalItems((prev) =>
      prev.map((item) => (item.id === 'c-1' || item.id === 'c-9' ? { ...item, isDiscovered: true } : item))
    );
  };

  // Toggle Favorite
  const handleToggleFavorite = (itemId: string) => {
    setCulturalItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, isFavorite: !item.isFavorite } : item))
    );
  };

  const handleOpenDetailById = (itemId: string) => {
    const item = culturalItems.find((c) => c.id === itemId);
    if (item) {
      setSelectedItem(item);
    }
  };

  // If user is logged out, show Login View
  if (!isLoggedIn) {
    return (
      <div className="w-full min-h-screen bg-slate-900 flex justify-center items-center">
        <LoginView
          onLoginSuccess={() => {
            setIsLoggedIn(true);
            setCurrentScreen('main');
          }}
          onOpenTerms={() => setCurrentScreen('terms')}
        />
      </div>
    );
  }

  // Full-screen secondary screens (Wardrobe, Puzzle, Settings, Terms)
  if (currentScreen === 'wardrobe') {
    return (
      <div className="w-full min-h-screen bg-slate-900 flex justify-center">
        <WardrobeView
          user={user}
          items={wardrobeItems}
          onBack={() => setCurrentScreen('main')}
          onEquipItem={handleEquipItem}
          onCraftFragment={handleCraftFragment}
        />
      </div>
    );
  }

  if (currentScreen === 'puzzle' && activeChallengeNode) {
    return (
      <div className="w-full min-h-screen bg-slate-900 flex justify-center">
        <PuzzleGameView
          node={activeChallengeNode}
          onClose={() => setCurrentScreen('main')}
          onSuccess={handlePuzzleSuccess}
        />
      </div>
    );
  }

  if (currentScreen === 'settings') {
    return (
      <div className="w-full min-h-screen bg-slate-900 flex justify-center">
        <SettingsView
          user={user}
          onBack={() => setCurrentScreen('main')}
          onLogout={() => {
            setIsLoggedIn(false);
            setCurrentScreen('main');
          }}
          onUpdateSettings={(updated) => setUser((prev) => ({ ...prev, ...updated }))}
          onOpenTerms={() => setCurrentScreen('terms')}
        />
      </div>
    );
  }

  if (currentScreen === 'terms') {
    return (
      <div className="w-full min-h-screen bg-slate-900 flex justify-center">
        <TermsView onBack={() => setCurrentScreen('main')} />
      </div>
    );
  }

  // Tab Title helper
  const getTabTitle = () => {
    switch (activeTab) {
      case 'village':
        return '畲韵奇旅';
      case 'explore':
        return '探索';
      case 'scan':
        return '扫描';
      case 'collection':
        return '文化图鉴';
      case 'mine':
        return '我的';
      default:
        return '畲韵奇旅';
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-900 flex justify-center font-sans antialiased">
      <div className="w-full max-w-md bg-[#f8fafc] min-h-screen flex flex-col relative shadow-2xl overflow-x-hidden">
        {/* Persistent Top Bar */}
        <TopBar
          user={user}
          title={getTabTitle()}
          onAvatarClick={() => setActiveTab('mine')}
          onPointsClick={() => setCurrentScreen('wardrobe')}
          rightBadgeType={activeTab === 'scan' ? 'points' : 'levelPoints'}
        />

        {/* Tab Views */}
        <main className="flex-1 flex flex-col">
          {activeTab === 'village' && (
            <VillageView
              user={user}
              equippedItems={wardrobeItems}
              onContinueJourney={() => setActiveTab('explore')}
              onOpenWardrobe={() => setCurrentScreen('wardrobe')}
              onOpenScan={() => setActiveTab('scan')}
              onOpenDetail={handleOpenDetailById}
              onUpdatePoints={handleUpdatePoints}
            />
          )}

          {activeTab === 'explore' && (
            <ExploreView
              user={user}
              nodes={exploreNodes}
              onStartChallenge={handleStartChallenge}
            />
          )}

          {activeTab === 'scan' && (
            <ScanView
              user={user}
              onUnlockReward={handleUnlockReward}
              onOpenDetail={handleOpenDetailById}
            />
          )}

          {activeTab === 'collection' && (
            <CollectionView
              user={user}
              items={culturalItems}
              onSelectItem={(item) => setSelectedItem(item)}
            />
          )}

          {activeTab === 'mine' && (
            <ProfileView
              user={user}
              badges={badges}
              onOpenWardrobe={() => setCurrentScreen('wardrobe')}
              onOpenCollection={() => setActiveTab('collection')}
              onOpenSettings={() => setCurrentScreen('settings')}
              onOpenTerms={() => setCurrentScreen('terms')}
              onOpenFeedback={() => setShowFeedbackModal(true)}
            />
          )}
        </main>

        {/* Persistent Bottom Navigation Bar */}
        <BottomNavBar activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Modals */}
        {selectedItem && (
          <ItemDetailModal
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {showSuccessModal && (
          <ChallengeSuccessModal
            onClose={() => setShowSuccessModal(false)}
            onViewKnowledge={() => {
              setShowSuccessModal(false);
              handleOpenDetailById('c-1');
            }}
            onNextLevel={handleNextLevelFromSuccess}
          />
        )}

        {showFeedbackModal && (
          <FeedbackModal onClose={() => setShowFeedbackModal(false)} />
        )}
      </div>
    </div>
  );
}

