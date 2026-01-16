import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const QuickNav = () => {
  const [activeSection, setActiveSection] = useState('plans');
  const [scrollProgress, setScrollProgress] = useState(0);

  const navItems = [
    { id: 'plans', icon: '🎨', label: '2026 계획' },
    { id: 'records', icon: '📝', label: '뜨개 기록' },
    { id: 'meeting', icon: '📊', label: '모임 통계' },
    { id: 'location', icon: '🗺️', label: '가고 싶은 장소' },
    { id: 'gallery', icon: '📸', label: '갤러리' }
  ];

  useEffect(() => {
    const handleScroll = () => {
      // 스크롤 진행도 계산
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const progress = (scrollTop / (documentHeight - windowHeight)) * 100;
      setScrollProgress(Math.min(progress, 100));

      // 현재 섹션 감지 (Scroll Spy)
      const sections = navItems.map(item => {
        const element = document.querySelector(`[data-section="${item.id}"]`);
        if (!element) return null;

        const rect = element.getBoundingClientRect();
        return {
          id: item.id,
          top: rect.top,
          bottom: rect.bottom,
          height: rect.height
        };
      }).filter(Boolean);

      // 뷰포트 중앙에 가장 가까운 섹션 찾기
      const viewportCenter = windowHeight / 2;
      let closestSection = sections[0];
      let minDistance = Math.abs(sections[0].top - viewportCenter);

      sections.forEach(section => {
        const distance = Math.abs(section.top - viewportCenter);
        if (distance < minDistance && section.top < viewportCenter && section.bottom > 0) {
          minDistance = distance;
          closestSection = section;
        }
      });

      if (closestSection) {
        setActiveSection(closestSection.id);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // 초기 실행

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.querySelector(`[data-section="${sectionId}"]`);
    if (element) {
      const offsetTop = element.offsetTop - 100; // 헤더 높이만큼 여백
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="hidden lg:block fixed right-8 top-1/2 transform -translate-y-1/2 z-40">
      <div className="flex items-center gap-4">
        {/* 스크롤 진행 바 */}
        <div className="relative h-64 w-0.5 bg-gray-200/60 rounded-full overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 w-full bg-gradient-to-b from-indie-pink to-soft-coral rounded-full"
            style={{ height: `${scrollProgress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>

        {/* 퀵 메뉴 */}
        <div className="bg-white/80 backdrop-blur-md rounded-full shadow-lg border border-gray-200/50 py-3 px-2">
          <div className="flex flex-col gap-2">
            {navItems.map((item, index) => (
              <motion.button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                className={`
                  relative w-10 h-10 rounded-full flex items-center justify-center
                  transition-all duration-300 group
                  ${activeSection === item.id
                    ? 'bg-gradient-to-br from-indie-pink to-soft-coral text-white shadow-md'
                    : 'text-gray-500 hover:text-indie-pink hover:bg-gray-100'
                  }
                `}
                title={item.label}
              >
                <span className="text-lg">{item.icon}</span>

                {/* 툴팁 */}
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  whileHover={{ opacity: 1, x: 0 }}
                  className="absolute right-full mr-3 px-3 py-1.5 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {item.label}
                  {/* 툴팁 화살표 */}
                  <div className="absolute right-0 top-1/2 transform translate-x-full -translate-y-1/2 w-0 h-0 border-l-4 border-l-gray-800 border-t-4 border-t-transparent border-b-4 border-b-transparent" />
                </motion.div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickNav;
