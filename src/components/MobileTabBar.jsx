import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const MobileTabBar = ({ activeTab, onTabChange }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const controls = useAnimation();

  const tabs = [
    {
      id: 'plans',
      label: '2026 계획',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      id: 'records',
      label: '뜨개 기록',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      )
    },
    {
      id: 'meeting',
      label: '모임 & 지도',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    {
      id: 'gallery',
      label: '작품 갤러리',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    }
  ];

  // Input/Textarea 포커스 감지
  useEffect(() => {
    const handleFocusIn = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        setIsInputFocused(true);
      }
    };

    const handleFocusOut = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        setIsInputFocused(false);
      }
    };

    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);

    return () => {
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  // 페이지 하단 도달 여부 확인
  const isNearBottom = () => {
    const scrollHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY;
    const clientHeight = window.innerHeight;
    // 하단 100px 이내면 true
    return scrollHeight - (scrollTop + clientHeight) < 100;
  };

  // 스크롤 감지 로직 (예외 상황 포함)
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // 예외 상황 1: Input 포커스 시 무조건 숨김
      if (isInputFocused) {
        setIsVisible(false);
        return;
      }

      // 예외 상황 2: 페이지 최하단 도달 시 무조건 표시
      if (isNearBottom()) {
        setIsVisible(true);
        return;
      }

      // 기본 로직: 스크롤이 50px 이상일 때만 작동
      if (currentScrollY < 50) {
        setIsVisible(true);
        return;
      }

      // 아래로 스크롤: 숨기기
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      }
      // 위로 스크롤: 보이기
      else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, isInputFocused]);

  // 탭 클릭 핸들러
  const handleTabClick = async (tabId) => {
    // 햅틱 바운스 애니메이션
    await controls.start({
      scale: [1, 0.85, 1.1, 1],
      transition: {
        duration: 0.4,
        ease: [0.34, 1.56, 0.64, 1] // 몽글몽글한 이징
      }
    });

    // 탭 변경
    onTabChange(tabId);

    // localStorage에 상태 저장
    localStorage.setItem('silmongsil_active_tab', tabId);

    // 해당 섹션으로 스크롤
    scrollToSection(tabId);
  };

  // 섹션으로 스크롤
  const scrollToSection = (tabId) => {
    const sectionMap = {
      'plans': 0, // 맨 위
      'records': document.querySelector('[data-section="records"]')?.offsetTop - 80 || 600,
      'meeting': document.querySelector('[data-section="meeting"]')?.offsetTop - 80 || 1400,
      'gallery': document.querySelector('[data-section="gallery"]')?.offsetTop - 80 || 2000
    };

    window.scrollTo({
      top: sectionMap[tabId] || 0,
      behavior: 'smooth'
    });
  };

  // 초기 로드 시 저장된 탭 복원
  useEffect(() => {
    const savedTab = localStorage.getItem('silmongsil_active_tab');
    if (savedTab && onTabChange) {
      onTabChange(savedTab);
    }
  }, []);

  return (
    <motion.div
      initial={{ y: 0 }}
      animate={{
        y: isVisible ? 0 : 120,
        opacity: isVisible ? 1 : 0
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        mass: 0.8
      }}
      className="fixed bottom-6 left-4 right-4 z-40 md:hidden"
    >
      {/* 탭 바 컨테이너 - 둥글게 떠있는 느낌 */}
      <div className="bg-white/95 backdrop-blur-xl rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-gray-200/30">
        <div className="max-w-lg mx-auto px-6 py-3">
          <div className="flex items-center justify-around">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                animate={controls}
                whileTap={{
                  scale: 0.85,
                  transition: { duration: 0.1 }
                }}
                className={`relative flex flex-col items-center justify-center py-1.5 px-2 rounded-full transition-all ${
                  activeTab === tab.id
                    ? 'text-indie-pink'
                    : 'text-gray-400'
                }`}
              >
                {/* 아이콘 컨테이너 */}
                <motion.div
                  animate={{
                    scale: activeTab === tab.id ? 1.15 : 1,
                    y: activeTab === tab.id ? -2 : 0
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 17
                  }}
                  className={`p-2.5 rounded-full transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-br from-indie-pink/15 to-soft-coral/10 shadow-lg shadow-indie-pink/20'
                      : 'bg-transparent'
                  }`}
                >
                  <motion.div
                    animate={{
                      rotate: activeTab === tab.id ? [0, -8, 8, -8, 0] : 0
                    }}
                    transition={{
                      duration: 0.6,
                      ease: [0.34, 1.56, 0.64, 1]
                    }}
                  >
                    {tab.icon}
                  </motion.div>
                </motion.div>

                {/* 라벨 - 활성 탭만 표시 */}
                <AnimatePresence mode="wait">
                  {activeTab === tab.id && (
                    <motion.span
                      initial={{ opacity: 0, y: -3 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -3 }}
                      transition={{ duration: 0.2 }}
                      className="text-[9px] mt-1 font-semibold whitespace-nowrap"
                    >
                      {tab.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MobileTabBar;
