// 배지 시스템 유틸리티

export const getBadge = (completedCount) => {
  if (completedCount === 0) {
    return {
      icon: '🐣',
      label: '시작했다',
      color: 'text-yellow-600'
    };
  } else if (completedCount >= 1 && completedCount <= 2) {
    return {
      icon: '✨',
      label: '왜케빠름',
      color: 'text-purple-600'
    };
  } else {
    return {
      icon: '🧶',
      label: '모터손',
      color: 'text-indie-pink'
    };
  }
};

// 완성작 개수 계산
export const getCompletedCount = (member) => {
  // projects 배열에서 completed된 항목 개수 세기
  if (member.projects && Array.isArray(member.projects)) {
    // 객체 배열 형식인 경우
    if (typeof member.projects[0] === 'object' && member.projects[0] !== null) {
      return member.projects.filter(p => p.completed && p.title).length;
    }
  }

  // 레거시: review.completed 필드에서 개수 추출 (하위 호환성)
  const completedText = member.review?.completed || '';
  const match = completedText.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
};

// 랭킹 데이터 계산 (실시간 동기화 - 캐싱 제거)
export const getRankingData = (members) => {
  // Firebase onSnapshot으로 실시간 데이터를 받으므로 캐싱 불필요
  // 매번 최신 데이터로 랭킹을 계산하여 즉시 반영
  const ranking = members
    .map(member => ({
      id: member.id,
      name: member.name,
      completedCount: getCompletedCount(member),
      badge: getBadge(getCompletedCount(member))
    }))
    .sort((a, b) => b.completedCount - a.completedCount);

  return ranking;
};
