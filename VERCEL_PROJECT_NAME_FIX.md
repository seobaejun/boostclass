# Vercel 프로젝트 이름 오류 해결 가이드

## ❌ 오류 메시지

```
The name contains invalid characters. Only letters, digits, and underscores are allowed. 
Furthermore, the name should not start with a digit.
```

## 🔍 원인

Vercel 프로젝트 이름이 규칙을 위반했습니다.

### Vercel 프로젝트 이름 규칙

✅ **허용되는 문자:**
- 영문자 (a-z, A-Z)
- 숫자 (0-9)
- 언더스코어 (_)

❌ **허용되지 않는 문자:**
- 하이픈 (-)
- 점 (.)
- 공백 ( )
- 기타 특수문자

⚠️ **제한사항:**
- 숫자로 시작할 수 없음

## ✅ 올바른 프로젝트 이름 예시

**사용 가능:**
- `boostclass_app`
- `boostclass_main`
- `boostclass_platform`
- `boostclass_project`
- `my_boostclass`

**사용 불가능:**
- `boostclass-app` (하이픈 불가)
- `boostclass.main` (점 불가)
- `boostclass main` (공백 불가)
- `7boostclass` (숫자로 시작 불가)

## 🔧 해결 방법

### 방법 1: 기존 프로젝트 이름 변경

1. **Vercel 대시보드 접속**
   - https://vercel.com/dashboard

2. **프로젝트 선택**
   - 배포 중인 프로젝트 클릭

3. **Settings → General** 이동

4. **"Project Name" 찾기**
   - 현재 프로젝트 이름 확인

5. **이름 변경**
   - 올바른 이름으로 변경 (예: `boostclass_app`)
   - "Save" 클릭

6. **재배포**
   - 변경 사항 반영을 위해 재배포 (자동 또는 수동)

### 방법 2: 새 프로젝트 생성 (필요 시)

1. **Vercel 대시보드 → "Add New" → "Project"**

2. **GitHub 저장소 연결**
   - 저장소 선택

3. **프로젝트 이름 입력**
   - 올바른 이름 사용 (예: `boostclass_app`)
   - 하이픈(-) 대신 언더스코어(_) 사용

4. **프로젝트 생성 및 배포**

## 📝 현재 권장 이름

현재 상황을 고려한 추천 이름:

1. **`boostclass_app`** (가장 추천)
   - 간단하고 명확
   - 언더스코어 사용

2. **`boostclass_main`**
   - 메인 프로젝트 의미
   - 언더스코어 사용

3. **`boostclass_platform`**
   - 플랫폼 의미
   - 언더스코어 사용

## ⚠️ 주의사항

- 프로젝트 이름을 변경하면 URL이 변경될 수 있습니다
  - 예: `your-app.vercel.app` → `your_app.vercel.app`
- 커스텀 도메인이 설정되어 있다면 영향 없음
- 환경 변수는 프로젝트 이름과 무관하게 유지됨

## 🔍 확인 방법

변경 후 다음을 확인하세요:

1. **프로젝트 이름이 올바르게 표시되는지**
2. **배포가 정상적으로 진행되는지**
3. **환경 변수가 유지되는지** (Settings → Environment Variables)

