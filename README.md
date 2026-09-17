# FORME Template Library

운영/유지보수를 고려해 HTML, CSS, JavaScript, 이미지 자산과 관리자 진입점을 분리했습니다.

## 구조
- index.html: 공개 화면
- admin/index.html: 관리자 화면
- assets/css/: reset, 디자인 토큰, 레이아웃, 공통 컴포넌트, 페이지별 CSS
- assets/js/data.js: 데이터 계층(추후 Supabase API로 교체)
- assets/js/components.js: UI 컴포넌트
- assets/js/app.js: 검색/필터/즐겨찾기 로직
- assets/images/: 이미지 자산

## 다음 단계
실운영 버전은 Supabase Auth/Storage/Database를 연결하고 data.js를 API 계층으로 교체합니다. 관리자 인증과 파일 CRUD는 공개 UI와 분리합니다.
Updated for Vercel deployment.
