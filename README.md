# 🥗 FocusOnMeal (사용자 맞춤형 스마트 식생활 관리 플랫폼)

> **"불안과 복잡함을 제거하고, 당신의 건강한 식사와 경제적 가치에만 집중하세요."**
> AI 식단 생성, 실시간 식재료 물가 트래킹, 식품 안전 정보를 통합하여 스마트한 식생활 솔루션을 제공합니다.

---

## 📽️ 프로젝트 발표 자료 (PDF)
프로젝트의 아키텍처, 데이터 흐름도, 상세 코드 리뷰가 포함된 자료입니다.
* [**👉 FocusOnMeal 프로젝트 발표 PDF 보기**](https://github.com/Jungbin12/FocusOnMeal/blob/main/MealKit%20%EB%B0%9C%ED%91%9C.pdf) 

---

## 1. 개요 및 배경
* 📅 **수행 기간**: 2024.11.12 ~ 2024.12.23 (팀 프로젝트)
* 🎯 **주요 타깃**: 합리적인 식비 지출과 건강한 식단을 원하는 1인 가구 및 주부
* ✅ **핵심 목표**:
    * 공공 데이터를 활용한 **실시간 식재료 물가 시각화**
    * 개인별 영양 기준에 따른 **AI 식단 관리**
    * **Spring Security + JWT**를 활용한 보안 강화 및 인증 시스템 구축

---

## 2. 사용 기술 (Tech Stack)

| 분류 | 기술 스택 |
| :--- | :--- |
| **Frontend** | `React 19 (Vite)`, `Chart.js`, `Axios`, `Tailwind CSS` |
| **Backend** | `Spring Boot 3.3.5`, `Spring Security`, `MyBatis` |
| **Database** | `Oracle DB` |
| **API** | `KAMIS API` (물가), `식약처 API` (식품안전), `OpenAI API` |
| **Security** | `JWT (JSON Web Token)`, `BCrypt Password Encoder` |

---

## 3. 핵심 담당 기능 (Individual Role)
> **"데이터 가공 최적화를 통해 시스템 성능을 개선하고, 복잡한 물가 정보를 사용자 중심의 시각화 인터페이스로 변환하는 데 집중했습니다."**

### ✅ 실시간 물가 트래커 및 데이터 시각화 (Data Engineering & Visual)
* **기능 설명**: 전국 지역별로 산재된 식재료 가격 정보를 수집하여 30일간의 평균 가격 추이와 등락률 분석 기능을 제공합니다.
* **화면 구현**:
* **시계열 차트**: `Chart.js`를 사용해 30일간의 가격 흐름을 시각화하고, Y축 범위를 가격 변동폭에 맞춰 동적으로 조절하여 사용자 가독성을 극대화했습니다.
* **가격 상태 피드백**: 전일/전월 대비 가격 등락률을 계산하여 상승(RED), 하락(BLUE)으로 시각화하여 최적의 구매 시점을 제시합니다.
    

* **필수 코드 (백엔드 데이터 전처리)**:
> 수천 건의 로우 데이터를 클라이언트에서 직접 처리할 때 발생하는 과부하를 방지하기 위해, Java **Stream API**를 활용하여 서버 단에서 데이터를 정규화한 핵심 로직입니다.

```java
/* [Back-end] Stream API를 활용한 날짜별 가격 데이터 그룹화 및 평균 계산 */
public List<PriceTrendDTO> getPriceTrend(String itemCode, int days) {
    List<PriceEntity> prices = priceRepository.findPriceHistory(itemCode, days);

    return prices.stream()
        .collect(Collectors.groupingBy(
            p -> p.getCollectedDate(), // 1. 날짜별로 그룹화 (시간 정보 제거)
            Collectors.averagingInt(PriceEntity::getPriceValue) // 2. 같은 날짜의 여러 지역 가격을 평균으로 계산
        ))
        .entrySet().stream()
        .map(entry -> new PriceTrendDTO(entry.getKey(), entry.getValue().intValue()))
        .sorted(Comparator.comparing(PriceTrendDTO::getRegDate)) // 3. 차트 출력을 위한 날짜순 정렬
        .collect(Collectors.toList());
}
```

/* [Back-end] BigDecimal을 활용한 정밀 등락률 계산 */
public double calculateRate(int current, int past) {
    if (past == 0) return 0.0;
    BigDecimal currentVal = BigDecimal.valueOf(current);
    BigDecimal pastVal = BigDecimal.valueOf(past);
    
    // 오차 없는 계산을 위해 BigDecimal 사용: (현재가-과거가)/과거가 * 100
    return currentVal.subtract(pastVal)
        .divide(pastVal, 4, RoundingMode.HALF_UP)
        .multiply(BigDecimal.valueOf(100))
        .doubleValue();
}

### ✅ 마이페이지 및 식단 관리 (Full-stack)
* **개인화 서비스**: 사용자 프로필 관리 및 즐겨찾기(식재료) 기능을 `REST API`로 구현.
* **상태 관리**: React의 상태 관리 로직을 통해 식단 삭제 및 업데이트 시 실시간 UI 반영.

### ✅ 식품 안전 알림 및 설정 (Notification)
* **공공 API 연동**: 식약처 안전 정보 뉴스를 조회하고 모달 형태의 UI로 제공.
* **사용자 설정**: 알림 ON/OFF 설정 기능을 구현하여 `Spring Security` 권한별 맞춤형 환경 구축.

---

## 4. 트러블 슈팅 (Problem Solving)

### 🚀 대용량 물가 데이터 처리 및 가공 최적화
* **문제**: 여러 지역의 식재료 가격 데이터가 혼재되어 있어, 그래프 렌더링 시 데이터 불일치 및 속도 저하 발생.
* **분석**: DB에서 가져온 로우 데이터(Raw Data)를 프론트엔드에서 처리하기에는 오버헤드가 큼.
* **해결**: 
    1.  **백엔드 전처리**: Controller 단에서 데이터를 넘기기 전, Java 8+ **Stream API**를 이용해 날짜별 평균가로 그룹화.
    2.  **데이터 정규화**: `Recharts/Chart.js`가 요구하는 JSON 규격에 맞춰 DTO 설계 후 전달.
* **결과**: 프론트엔드 연산 부하를 최소화하고, 안정적인 시계열 차트 렌더링 구현.

---

## 5. 성장 경험
* **풀스택 역량 강화**: `React`와 `Spring Boot 3` 사이의 비동기 통신(Axios)과 `JWT` 인증 과정을 직접 구현하며 전체적인 웹 서비스 구조를 이해하게 되었습니다.
* **데이터 기반 사고**: 공공 데이터를 가공하여 사용자에게 유의미한 시각적 정보(그래프, 등락률)로 변환하는 과정을 통해 **'데이터 활용 능력'**을 길렀습니다.
* **보안 의식**: `Spring Security` 환경에서 비밀번호 암호화 및 토큰 기반 인증의 중요성을 학습했습니다.
