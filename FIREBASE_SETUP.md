# Firebase 설정 가이드

실몽실 뜨개모임 프로젝트를 Firebase와 연동하는 방법을 설명합니다.

## 1. Firebase 프로젝트 생성

1. [Firebase Console](https://console.firebase.google.com/)에 접속
2. "프로젝트 추가" 클릭
3. 프로젝트 이름 입력 (예: `silmongsil-knitting`)
4. Google Analytics는 선택사항 (원하시면 활성화)
5. 프로젝트 생성 완료

## 2. Firebase Web 앱 추가

1. Firebase 콘솔에서 프로젝트 선택
2. 프로젝트 개요 > "앱 추가" > "웹 앱" (</> 아이콘) 선택
3. 앱 닉네임 입력 (예: `silmongsil-web`)
4. "Firebase Hosting도 설정" 체크 (선택사항)
5. "앱 등록" 클릭
6. **Firebase SDK 구성 정보를 복사**해둡니다 (다음 단계에서 사용)

## 3. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 Firebase SDK 정보를 입력합니다:

```bash
# .env 파일 생성
cp .env.example .env
```

`.env` 파일에 Firebase 설정 정보를 입력:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Google Maps API Key (선택사항)
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

## 4. Firestore 데이터베이스 설정

1. Firebase 콘솔 > "Firestore Database" 선택
2. "데이터베이스 만들기" 클릭
3. **프로덕션 모드**로 시작 (또는 테스트 모드)
4. 리전 선택: `asia-northeast3 (Seoul)` 권장
5. "사용 설정" 클릭

### 보안 규칙 설정

Firestore > "규칙" 탭에서 다음 규칙을 설정:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // 멤버 컬렉션: 모두 읽기/쓰기 가능 (테스트용)
    match /members/{memberId} {
      allow read, write: if true;
    }

    // 장소 컬렉션: 모두 읽기/쓰기 가능
    match /locations/{locationId} {
      allow read, write: if true;
    }

    // 사진 컬렉션: 모두 읽기/쓰기 가능
    match /photos/{photoId} {
      allow read, write: if true;
    }

    // 모임 기록 컬렉션: 모두 읽기/쓰기 가능
    match /meetings/{meetingId} {
      allow read, write: if true;
    }
  }
}
```

**주의**: 위 규칙은 테스트용입니다. 실제 운영 시에는 인증을 추가해야 합니다!

## 5. Firebase Storage 설정

1. Firebase 콘솔 > "Storage" 선택
2. "시작하기" 클릭
3. 보안 규칙 선택 (테스트 모드 또는 프로덕션 모드)
4. 리전 선택: `asia-northeast3 (Seoul)` 권장
5. "완료" 클릭

### Storage 보안 규칙

Storage > "Rules" 탭에서:

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    match /photos/{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

## 6. 데이터베이스 스키마

### Members 컬렉션

```javascript
{
  "name": "string",           // 멤버 이름
  "projects": ["string"],     // 올해 뜨고 싶은 작품 (배열, 최대 5개)
  "events": ["string"],       // 참가 희망 이벤트 (배열)
  "goal": "string",           // 올해의 목표
  "createdAt": "timestamp",   // 생성 시간
  "updatedAt": "timestamp"    // 수정 시간 (선택)
}
```

### Locations 컬렉션

```javascript
{
  "name": "string",           // 장소 이름
  "lat": "number",            // 위도
  "lng": "number",            // 경도
  "createdAt": "timestamp"    // 생성 시간
}
```

### Photos 컬렉션

```javascript
{
  "title": "string",          // 작품 제목
  "author": "string",         // 작성자
  "date": "string",           // 날짜 (YYYY.MM.DD)
  "imageUrl": "string",       // Firebase Storage URL
  "storagePath": "string",    // Storage 경로
  "createdAt": "timestamp"    // 생성 시간
}
```

### Meetings 컬렉션

```javascript
{
  "date": "timestamp",        // 모임 날짜
  "attendees": ["string"],    // 참석자 ID 배열 (members 컬렉션의 ID)
  "createdAt": "timestamp"    // 생성 시간
}
```

## 7. 초기 데이터 추가 (선택사항)

Firestore Console에서 수동으로 초기 데이터를 추가할 수 있습니다:

### Members 컬렉션 예시

1. Firestore > "데이터" 탭
2. "컬렉션 시작" 클릭
3. 컬렉션 ID: `members`
4. 첫 번째 문서 추가:

```json
{
  "name": "민지",
  "projects": ["모헤어 가디건", "아기 블랭킷", "코바늘 가방", "겨울 머플러", "니트 베레모"],
  "events": ["원데이 클래스", "전시회 관람"],
  "goal": "매주 최소 3시간 뜨기, 5개 작품 완성하기",
  "createdAt": "2026-01-16T00:00:00.000Z"
}
```

## 8. Google Maps API 설정 (선택사항)

실제 지도 기능을 사용하려면:

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 생성 또는 선택
3. "API 및 서비스" > "라이브러리"
4. "Maps JavaScript API" 검색 및 활성화
5. "사용자 인증 정보" > "사용자 인증 정보 만들기" > "API 키"
6. API 키 복사하여 `.env` 파일에 추가

```env
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

**주의**: API 키 제한을 설정하여 보안을 강화하세요!

## 9. 개발 서버 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

## 트러블슈팅

### Firebase 연결 오류

- `.env` 파일이 올바르게 설정되었는지 확인
- Firebase 프로젝트가 활성화되어 있는지 확인
- 개발 서버를 재시작 (`npm run dev`)

### Firestore 권한 오류

- Firestore 보안 규칙이 올바르게 설정되었는지 확인
- 테스트 모드로 설정했는지 확인

### Storage 업로드 오류

- Storage가 활성화되어 있는지 확인
- Storage 보안 규칙이 올바르게 설정되었는지 확인

### Google Maps가 표시되지 않음

- Google Maps API 키가 `.env`에 올바르게 설정되었는지 확인
- Google Maps JavaScript API가 활성화되어 있는지 확인
- API 키에 대한 제한이 너무 엄격하지 않은지 확인

## 보안 주의사항

**중요**: 현재 설정은 테스트/개발용입니다!

실제 운영 시에는:
1. Firebase Authentication 설정
2. Firestore 및 Storage 보안 규칙 강화
3. API 키 제한 설정
4. `.env` 파일을 `.gitignore`에 추가 (이미 추가됨)

## 참고 자료

- [Firebase 문서](https://firebase.google.com/docs)
- [Firestore 시작하기](https://firebase.google.com/docs/firestore/quickstart)
- [Firebase Storage 가이드](https://firebase.google.com/docs/storage/web/start)
- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript/overview)
