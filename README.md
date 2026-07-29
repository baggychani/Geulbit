# 글빛 (Geulbit)

한글 **초성·중성·종성**을 서로 다른 색으로 나눠 보여 주고, SVG·PNG로 내보낼 수 있는 웹 도구입니다.  
**한글 모아쓰기·색채 분리** 수업이나 자료 제작할 때, 글자 한 음절씩 색을 입혀 인쇄·프레젠테이션에 쓰기 위해 만들었습니다.

UnDotum 계열 폰트의 **복합 글리프**를 `opentype.js`로 풀어, 받침이 있는 글자도 자소 단위로 색을 입힐 수 있습니다. (일반 / 굵게 전환 지원)

## 만든 사람

**우지인 · 배기찬** ([@baggychani](https://github.com/baggychani)) — 합작

## 필요한 것

- [Node.js](https://nodejs.org/) (LTS 권장)

## 실행 방법

저장소를 받은 뒤 프로젝트 폴더에서:

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:5173` 을 엽니다.

Windows에서는 루트의 **`start.bat`**, Python이 있으면 **`start.py`** 를 실행해도 됩니다. (의존성 확인 후 dev 서버와 브라우저를 띄웁니다.)

## 사용 방법

1. **글자 입력**에 한글을 입력합니다.
2. **색상** 탭에서 초·중·종(받침) 색을 고르거나, **템플릿**에서 조합을 고릅니다.
3. **미리보기**에서 결과를 확인합니다. (크기 S / M / L, 폰트 일반·굵게)
4. **내보내기** 탭에서 SVG 또는 투명 PNG로 저장합니다.

폰트 파일은 `public/UnDotum.ttf`, `public/UnDotumBold.ttf` 를 사용합니다.

## 빌드

```bash
npm run build
npm run preview
```

## 라이선스·폰트

UnDotum 폰트의 사용·배포 조건은 해당 폰트의 라이선스를 따릅니다. 교실·개인 자료 용도로 사용하는 것을 전제로 한 프로젝트입니다.
