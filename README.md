# 글빛 (Geulbit)

한글 한 글자를 초성·중성·종성으로 분해해 각각 다른 색으로 보여 주고, 결과를 SVG 또는 투명 PNG로 내보내는 웹 도구입니다. 수업 자료, 한글 구조 설명, 인쇄물과 프레젠테이션용 시각 자료 제작에 쓸 수 있습니다.

[글빛 열기](https://baggychani.github.io/Geulbit/)

## 주요 기능

- 완성형 한글 음절의 초성·중성·종성 색상 분리
- UnDotum 일반·굵게 글꼴 전환
- 기본 모아쓰기와 자모 그리드 배치 모드
- 겹침 순서와 미리보기 크기·배경 변경
- 색상 템플릿과 직접 색상 입력
- SVG 또는 투명 PNG 다운로드
- 여러 글자 ZIP 내보내기와 중복 글자 건너뛰기
- 한국어, 영어, 터키어 인터페이스

## 사용 방법

1. 왼쪽의 **글자 입력** 칸에 한글을 입력합니다.
2. **색상** 탭에서 초성·중성·종성 색을 고르거나 **템플릿** 탭에서 조합을 선택합니다.
3. **미리보기**에서 결과와 자모 분석을 확인합니다.
4. 필요하면 배치 모드, 겹침 순서, 글꼴 굵기, 미리보기 크기를 조절합니다.
5. **내보내기** 탭에서 SVG 또는 투명 PNG로 저장합니다. 여러 글자는 ZIP 하나로 받을 수 있습니다.

## 로컬 실행

Node.js LTS가 필요합니다.

```bash
npm ci
npm run dev
```

개발 서버를 시작한 뒤 브라우저에서 `http://localhost:5173`을 엽니다.

Windows에서는 `start.bat` 또는 `start.py`로 개발 서버를 실행할 수도 있습니다.

## 검증과 빌드

```bash
npm test
npm run build
npm run preview
```

`npm test`는 한글 음절 분해, 자모 분류, 레이어 순서, 자모 그리드 계산을 검증합니다. `npm run build` 결과물은 `dist/`에 생성됩니다.

## GitHub Pages 배포

`main` 브랜치에 푸시하면 GitHub Actions가 의존성을 설치하고, 테스트와 프로덕션 빌드를 실행한 뒤 `dist/`를 GitHub Pages에 배포합니다. 배포 주소는 다음과 같습니다.

<https://baggychani.github.io/Geulbit/>

## 프로젝트 구조

```text
src/
  components/  화면 구성 요소
  hooks/       글꼴 로딩 상태 관리
  utils/       한글 분해, 글꼴 파싱, 내보내기, 번역
tests/         Node 기반 단위 테스트
.github/       GitHub Pages 배포 워크플로
public/        UnDotum 글꼴과 정적 파일
```

## 글꼴

화면과 내보내기에는 `public/UnDotum.ttf`, `public/UnDotumBold.ttf`를 사용합니다. 서비스 외부로 배포하거나 재사용할 때는 해당 글꼴의 라이선스와 사용 조건을 확인하세요.

## 만든 사람

만든 사람: 배기찬, 우지인
