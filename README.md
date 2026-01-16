# 실몽실 뜨개모임 - 디지털 무드보드

20명 규모의 뜨개모임을 위한 따뜻하고 트렌디한 디지털 무드보드 웹 애플리케이션입니다.

## 주요 기능

### 1. 헤더 (Header)
- 모임 이름 편집 기능
- 개인 닉네임 설정
- 부드러운 애니메이션 효과

### 2. 멤버 카드 (Member Cards)
- 20명의 멤버를 위한 포스트잇 스타일 카드
- 각 카드에 포함된 정보:
  - 올해 뜨고 싶은 작품 5가지
  - 참가 희망 이벤트
  - 올해의 목표
- 호버 시 부드러운 확대 및 회전 애니메이션

### 3. 모임 횟수 카운터 (Meeting Counter)
- 한 달 목표 모임 횟수 설정 (1-4회)
- 실시간 카운터 증가 기능
- 진행률 바 시각화
- 초기화 기능

### 4. 지도 섹션 (Map Section)
- 가고 싶은 장소 표시 (UI만 구현)
- 핀 마커로 위치 표시
- Google Maps API 연동 예정

### 5. 아카이브 갤러리 (Archive Gallery)
- 폴라로이드 스타일 사진 갤러리
- 완성된 작품 전시
- 사진 업로드 기능 (Supabase 연동 예정)

## 디자인 특징

- **컬러 팔레트**: 아이보리, 인디핑크, 연한 베이지 등 따뜻한 톤
- **부드러운 곡선**: 모든 요소에 rounded corners 적용
- **애니메이션**: Framer Motion을 활용한 부드러운 인터랙션
- **반응형 디자인**: 모바일과 데스크톱 모두 지원

## 기술 스택

- **React**: UI 라이브러리
- **Vite**: 빌드 도구
- **Tailwind CSS**: 스타일링
- **Framer Motion**: 애니메이션
- **Firebase**: 실시간 데이터베이스 및 스토리지
  - Firestore: 멤버, 장소 데이터 저장
  - Storage: 사진 업로드 및 저장
- **Google Maps API**: 실제 지도 기능 (선택사항)

## 설치 및 실행

### 개발 환경 요구사항
- Node.js 18.x 이상

### 1. 설치
```bash
npm install
```

### 2. Firebase 설정

Firebase 설정이 필요합니다. 자세한 내용은 [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)를 참고하세요.

간단 요약:
1. Firebase 프로젝트 생성
2. `.env.example`을 복사하여 `.env` 파일 생성
3. Firebase 설정 정보를 `.env`에 입력

```bash
cp .env.example .env
# .env 파일을 열어 Firebase 설정 정보 입력
```

### 3. 개발 서버 실행
```bash
npm run dev
```

개발 서버가 실행되면 브라우저에서 `http://localhost:5173`로 접속하세요.

**참고**: Firebase 설정 없이도 실행은 가능하지만, 데이터 저장/불러오기 기능은 작동하지 않습니다.

### 빌드
```bash
npm run build
```

### 프리뷰
```bash
npm run preview
```

## 프로젝트 구조

```
src/
├── components/
│   ├── Header.jsx                 # 헤더 컴포넌트
│   ├── MemberCard.jsx             # 멤버 카드 (편집 기능 포함)
│   ├── MeetingCounter.jsx         # 모임 횟수 카운터
│   ├── MapSection.jsx             # Mock 지도 섹션
│   ├── MapSectionWithGoogle.jsx   # Google Maps 연동 지도
│   └── ArchiveGallery.jsx         # 사진 갤러리 (업로드 기능)
├── firebase/
│   └── config.js                  # Firebase 설정
├── hooks/
│   ├── useMembers.js              # 멤버 데이터 CRUD
│   ├── useLocations.js            # 장소 데이터 CRUD
│   └── usePhotos.js               # 사진 업로드/삭제
├── data/
│   └── mockData.js                # Mock 데이터 (참고용)
├── App.jsx                        # 메인 앱 컴포넌트
├── index.css                      # Tailwind CSS 설정
└── main.jsx                       # 엔트리 포인트
```

## 커스터마이징

### 색상 변경
`tailwind.config.js` 파일에서 커스텀 색상을 수정할 수 있습니다:

```javascript
colors: {
  ivory: '#FFFFF0',
  'indie-pink': '#FFB6C1',
  'light-beige': '#F5E6D3',
  'warm-cream': '#FFF8E7',
  'soft-coral': '#FFD4D4',
  'dusty-rose': '#E8C4C4',
}
```

### 멤버 데이터 추가/수정

Firebase Console에서 직접 데이터를 추가하거나, 각 멤버 카드의 편집 버튼을 클릭하여 웹에서 수정할 수 있습니다.

## 주요 기능 사용법

### 멤버 카드 편집
1. 각 멤버 카드 우측 상단의 연필 아이콘 클릭
2. 이름, 작품, 이벤트, 목표 입력
3. "저장" 버튼 클릭

### 장소 추가 (Google Maps 연동 시)
1. "장소 추가하기" 버튼 클릭
2. 지도에서 원하는 위치 클릭
3. 장소 이름 입력
4. "추가" 버튼 클릭

### 사진 업로드
1. 갤러리 하단의 "사진 추가" 카드 클릭
2. 업로드할 사진 선택
3. 작품 제목과 작성자 이름 입력
4. "업로드" 버튼 클릭

## 구현 완료 기능

- [x] Firebase Firestore 연동 (실시간 데이터 저장)
- [x] Firebase Storage 연동 (사진 업로드)
- [x] 멤버 카드 편집 기능
- [x] Google Maps API 연동 (선택사항)
- [x] 장소 추가/삭제 기능
- [x] 사진 업로드/삭제 기능
- [x] 실시간 데이터 동기화

## 향후 개발 계획

- [ ] Firebase Authentication (사용자 인증)
- [ ] 멤버별 개인 페이지
- [ ] 모임 일정 캘린더
- [ ] 실 재고 관리 기능
- [ ] 패턴 공유 기능
- [ ] 댓글 기능
- [ ] 좋아요 기능

## 라이선스

MIT

---

**만든이**: 실몽실 뜨개모임 2026
