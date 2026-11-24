# 야작식당 공략노트

동방야작식당 한국어 공략 사이트예요. [Astro Starlight](https://starlight.astro.build)로 만들었어요.

## 폴더 구조

```
src/content/docs/        ← 공략 글은 전부 여기 (.md 파일)
  index.mdx              ← 첫 화면
  guide/                 ← 초보자 가이드, 용어 대조표
  customers/             ← 손님 정리
  tags/                  ← 요리·술 태그
  dlc/                   ← DLC·업데이트
  about.md, privacy.md   ← 소개, 개인정보처리방침 (애드센스 승인에 필요)
src/styles/custom.css    ← 색깔·글꼴
src/components/AdSlot.astro ← 광고 자리
astro.config.mjs         ← 사이트 이름, 주소, 왼쪽 메뉴
```

`✏️ 작성 메모`라고 적힌 줄은 나를 위한 메모예요. 글을 다 쓰면 지우세요.

---

## 1단계: 깃헙에 올리기

1. GitHub에서 **New repository**를 누르고 이름을 정해요. 예: `mystia-guide`. 공개(Public)로 만들어요.
2. 이 폴더의 파일을 전부 올려요. 가장 쉬운 방법은 **Add file › Upload files**에 폴더 안 내용을 끌어다 놓는 거예요.
   - `.github` 폴더처럼 점으로 시작하는 폴더도 꼭 같이 올라가야 해요. 웹 업로드에서 빠지면 GitHub Desktop 앱을 쓰세요.
3. 저장소 **Settings › Pages**로 가서 **Source**를 **GitHub Actions**로 바꿔요.
4. **Actions** 탭에서 초록색 체크가 뜨면 `https://아이디.github.io/mystia-guide/`에서 사이트가 열려요.
   - 도메인을 연결하기 전까지는 주소 끝에 저장소 이름이 붙어서 일부 링크가 어긋날 수 있어요. 도메인을 연결하면 해결돼요.

## 2단계: 내 컴퓨터에서 미리 보기 (선택)

[Node.js](https://nodejs.org)를 설치한 뒤 이 폴더에서 아래 명령을 실행해요.

```
npm install
npm run dev
```

그다음 `http://localhost:4321`을 열면 글을 고칠 때마다 바로 바뀌는 걸 볼 수 있어요.

## 3단계: 글 쓰기

- 새 글은 `src/content/docs/` 아래에 `.md` 파일로 만들어요. 맨 위에 `title`과 `description`을 꼭 적어요. description은 검색 결과에 나오는 설명이에요.
- 왼쪽 메뉴에 보이게 하려면 `astro.config.mjs`의 `sidebar`에 한 줄 추가해요.
- 스크린샷은 `src/assets/` 폴더에 넣고 글에서 `![설명](../../../assets/파일.png)`처럼 불러와요.
- 깃헙에 올리면 1~2분 뒤 사이트에 자동으로 반영돼요.

## 4단계: 도메인 연결

1. 도메인을 사요. 가비아, 카페24, Cloudflare, Namecheap 같은 곳에서 살 수 있어요. 예: `mystia.kr`
2. 도메인 회사의 DNS 설정에서:
   - `www` 를 **CNAME**으로 `아이디.github.io` 에 연결해요.
   - 맨 앞 주소(@)는 **A 레코드** 4개를 깃헙 페이지 IP로 연결해요. IP 목록은 [GitHub 공식 문서](https://docs.github.com/ko/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)에 있어요.
3. 저장소 **Settings › Pages › Custom domain**에 도메인을 넣고 **Enforce HTTPS**를 체크해요.
4. `astro.config.mjs` 맨 위의 `SITE`를 내 도메인으로 바꿔요. 예: `'https://mystia.kr'`

## 5단계: 애드센스

1. 글이 20~30개쯤 쌓이고 도메인이 연결되면 신청해요. 만 18세 미만이면 보호자 계정으로 신청해야 해요.
2. `about.md`와 `privacy.md`의 이메일 주소를 채워요.
3. 승인되면:
   - 저장소 **Settings › Secrets and variables › Actions › Variables**에 `PUBLIC_ADSENSE_ID` = `ca-pub-로 시작하는 번호`를 추가해요.
   - `public/ads.txt` 파일을 만들고 애드센스가 알려주는 한 줄을 넣어요.
   - 글 중간에 광고를 넣고 싶으면 파일을 `.mdx`로 만들고 `<AdSlot slot="광고단위번호" />`를 넣어요. 사용법은 `index.mdx`를 참고하세요.
