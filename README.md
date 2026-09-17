# WorkFlow Template Library

운영/유지보수를 고려해 HTML, CSS, JavaScript, 이미지 자산과 관리자 진입점을 분리했습니다.

## 구조
- index.html: 공개 화면
- admin/index.html: 관리자 화면
- assets/css/: reset, 디자인 토큰, 레이아웃, 공통 컴포넌트, 페이지별 CSS
- assets/js/data.js: 데이터 계층(추후 Supabase API로 교체)
- assets/js/components.js: UI 컴포넌트
- assets/js/app.js: 검색/필터/즐겨찾기 로직
- assets/images/: 이미지 자산

## 운영 보안
- 공개 홈페이지는 템플릿 조회와 다운로드만 허용합니다.
- `/admin/`은 등록된 관리자 이메일의 Supabase Magic Link 세션이 필요합니다.
- Storage 쓰기·수정·삭제 정책은 서버가 발급한 `app_metadata.role=admin` 권한을 확인합니다.
- publishable key만 브라우저에 사용하며 service-role key는 사용하지 않습니다.
- 관리자는 업로드 시 대표 이미지 원본을 그대로 저장할 수 있습니다.
