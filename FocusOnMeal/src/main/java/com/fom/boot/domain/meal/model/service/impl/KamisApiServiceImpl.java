package com.fom.boot.domain.meal.model.service.impl;

import com.fom.boot.domain.meal.model.service.KamisApiService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

/**
 * KAMIS API 호출 서비스
 * 농산물 가격 정보 조회
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class KamisApiServiceImpl implements KamisApiService {
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${api.kamis.cert-key}")
    private String certKey;

    @Value("${api.kamis.cert-id}")
    private String certId;

    @Value("${api.kamis.url}")
    private String apiUrl;

    /**
     * 특정 품목의 최신 소매가격 조회
     *
     * @param itemName 품목명 (예: 쌀, 배추, 무 등)
     * @return 가격 정보 (원)
     */
    public Integer getRetailPrice(String itemName) {
        log.info("KAMIS API call - item: {}", itemName);

        try {
            String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));

            // URL 생성
            String url = UriComponentsBuilder.fromHttpUrl(apiUrl)
                    .queryParam("action", "dailyPriceByCategoryList")
                    .queryParam("p_cert_key", certKey)
                    .queryParam("p_cert_id", certId)
                    .queryParam("p_returntype", "json")
                    .queryParam("p_regday", today)
                    .queryParam("p_itemcategorycode", "200")  // 채소류 (품목에 따라 변경 필요)
                    .queryParam("p_convert_kg_yn", "Y")
                    .build()
                    .toUriString();

            log.debug("KAMIS API request URL: {}", url);

            // API 호출
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);

            // 응답 파싱
            Integer price = parsePriceFromResponse(response.getBody(), itemName);

            if (price != null) {
                log.info("KAMIS API call success - item: {}, price: {} KRW", itemName, price);
            } else {
                log.warn("KAMIS API - item not found: {}", itemName);
            }

            return price;

        } catch (Exception e) {
            log.error("KAMIS API call failed - item: {}", itemName, e);
            return null;
        }
    }

    /**
     * 품목별 일일 가격 조회
     *
     * @param categoryCode 부류코드 (100:식량작물, 200:채소류, 300:과일류, 400:축산물)
     * @param itemCode 품목코드
     * @return 가격 (원/kg)
     */
    public Integer getDailyPrice(String categoryCode, String itemCode) {
        log.info("KAMIS API daily price query - category: {}, itemCode: {}", categoryCode, itemCode);

        try {
            String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));

            String url = UriComponentsBuilder.fromHttpUrl(apiUrl)
                    .queryParam("action", "dailyPriceByCategoryList")
                    .queryParam("p_cert_key", certKey)
                    .queryParam("p_cert_id", certId)
                    .queryParam("p_returntype", "json")
                    .queryParam("p_regday", today)
                    .queryParam("p_itemcategorycode", categoryCode)
                    .queryParam("p_itemcode", itemCode)
                    .queryParam("p_convert_kg_yn", "Y")
                    .build()
                    .toUriString();

            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);

            return parseFirstPrice(response.getBody());

        } catch (Exception e) {
            log.error("KAMIS API daily price query failed", e);
            return null;
        }
    }

    /**
     * API 응답에서 특정 품목의 가격 파싱
     */
    private Integer parsePriceFromResponse(String responseBody, String itemName) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode data = root.path("data");

            // 에러 응답 체크: {"data":["001"]} 형태
            if (data.isArray() && data.size() > 0 && !data.get(0).isObject()) {
                String errorCode = data.get(0).asText();
                log.warn("KAMIS API - error code: {}", errorCode);
                return null;
            }

            // 실제 데이터 구조: {"data":{"error_code":"000","item":[...]}}
            JsonNode items = null;
            if (data.isObject() && data.has("item")) {
                items = data.path("item");
            } else if (data.isArray()) {
                items = data;
            }

            if (items == null || !items.isArray() || items.size() == 0) {
                log.warn("KAMIS API - no response data");
                return null;
            }

            // 품목명으로 검색
            for (JsonNode item : items) {
                String name = item.path("item_name").asText();
                if (name.contains(itemName) || itemName.contains(name)) {
                    // 평균 가격 추출 (dpr1: 당일 → dpr2: 1일전 → dpr3: 1주일전 fallback)
                    String priceStr = null;

                    // 1. 당일 가격 시도
                    priceStr = item.path("dpr1").asText();
                    if (priceStr != null && !priceStr.isEmpty() && !"-".equals(priceStr)) {
                        return Integer.parseInt(priceStr.replace(",", ""));
                    }

                    // 2. 1일전 가격 시도
                    priceStr = item.path("dpr2").asText();
                    if (priceStr != null && !priceStr.isEmpty() && !"-".equals(priceStr)) {
                        log.debug("No today price, using 1 day ago: {}", priceStr);
                        return Integer.parseInt(priceStr.replace(",", ""));
                    }

                    // 3. 1주일전 가격 시도
                    priceStr = item.path("dpr3").asText();
                    if (priceStr != null && !priceStr.isEmpty() && !"-".equals(priceStr)) {
                        log.debug("No 1 day ago price, using 1 week ago: {}", priceStr);
                        return Integer.parseInt(priceStr.replace(",", ""));
                    }
                }
            }

            return null;

        } catch (Exception e) {
            log.error("KAMIS response parsing failed", e);
            return null;
        }
    }

    /**
     * 첫 번째 품목의 가격 파싱
     */
    private Integer parseFirstPrice(String responseBody) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode data = root.path("data");

            // 에러 응답 체크: {"data":["001"]} 형태
            if (data.isArray() && data.size() > 0 && !data.get(0).isObject()) {
                String errorCode = data.get(0).asText();
                log.warn("KAMIS API - error code: {}", errorCode);
                return null;
            }

            // 실제 데이터 구조: {"data":{"error_code":"000","item":[...]}}
            JsonNode items = null;
            if (data.isObject() && data.has("item")) {
                items = data.path("item");
            } else if (data.isArray()) {
                items = data;
            }

            if (items == null || !items.isArray() || items.size() == 0) {
                return null;
            }

            JsonNode firstItem = items.get(0);
            String priceStr = null;

            // dpr1: 당일 → dpr2: 1일전 → dpr3: 1주일전 fallback
            priceStr = firstItem.path("dpr1").asText();
            if (priceStr != null && !priceStr.isEmpty() && !"-".equals(priceStr)) {
                return Integer.parseInt(priceStr.replace(",", ""));
            }

            priceStr = firstItem.path("dpr2").asText();
            if (priceStr != null && !priceStr.isEmpty() && !"-".equals(priceStr)) {
                log.debug("No today price, using 1 day ago");
                return Integer.parseInt(priceStr.replace(",", ""));
            }

            priceStr = firstItem.path("dpr3").asText();
            if (priceStr != null && !priceStr.isEmpty() && !"-".equals(priceStr)) {
                log.debug("No 1 day ago price, using 1 week ago");
                return Integer.parseInt(priceStr.replace(",", ""));
            }

            return null;

        } catch (Exception e) {
            log.error("Price parsing failed", e);
            return null;
        }
    }

    /**
     * API 연결 테스트
     */
    public String testConnection() {
        log.info("KAMIS API connection test started");

        try {
            // 오늘부터 7일 전까지 시도
            for (int daysBack = 0; daysBack <= 7; daysBack++) {
                String testDate = LocalDate.now().minusDays(daysBack)
                        .format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));

                // 여러 부류 코드로 시도
                String[] categories = {"100", "200", "300", "400"}; // 식량작물, 채소류, 과일류, 축산물

                for (String categoryCode : categories) {
                    String url = UriComponentsBuilder.fromHttpUrl(apiUrl)
                            .queryParam("action", "dailyPriceByCategoryList")
                            .queryParam("p_cert_key", certKey)
                            .queryParam("p_cert_id", certId)
                            .queryParam("p_returntype", "json")
                            .queryParam("p_regday", testDate)
                            .queryParam("p_itemcategorycode", categoryCode)
                            .queryParam("p_convert_kg_yn", "Y")
                            .build()
                            .toUriString();

                    log.debug("KAMIS API test - date: {}, category: {}", testDate, categoryCode);

                    try {
                        ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);

                        if (response.getStatusCode().is2xxSuccessful()) {
                            String responseBody = response.getBody();
                            log.debug("KAMIS API response: {}", responseBody);

                            JsonNode root = objectMapper.readTree(responseBody);
                            JsonNode data = root.path("data");

                            // 실제 데이터 구조 확인: {"data":{"error_code":"000","item":[...]}}
                            // 에러 구조: {"data":["001"]}
                            if (data.isObject() && data.has("item")) {
                                JsonNode items = data.path("item");
                                if (items.isArray() && items.size() > 0) {
                                    String categoryName = getCategoryName(categoryCode);
                                    log.info("KAMIS API connection success - date: {}, category: {}, items: {}",
                                            testDate, categoryName, items.size());
                                    return String.format("Connection success - %s (%s) %d items found",
                                            testDate, categoryName, items.size());
                                }
                            } else if (data.isArray() && data.size() > 0) {
                                // 에러 코드 배열인 경우
                                String errorCode = data.get(0).asText();
                                log.debug("KAMIS API error code - date: {}, category: {}, code: {}",
                                        testDate, categoryCode, errorCode);
                            }
                        }
                    } catch (Exception e) {
                        log.debug("KAMIS API test failed - date: {}, category: {}", testDate, categoryCode);
                    }
                }
            }

            return "Connection success but no data for recent 7 days (possibly weekend/holiday)";

        } catch (Exception e) {
            log.error("KAMIS API connection test failed", e);
            return "Connection failed: " + e.getMessage();
        }
    }

    /**
     * 부류 코드를 한글명으로 변환
     */
    private String getCategoryName(String code) {
        return switch (code) {
            case "100" -> "Grains";
            case "200" -> "Vegetables";
            case "300" -> "Fruits";
            case "400" -> "Livestock";
            default -> "Others";
        };
    }

    /**
     * KAMIS API 원본 응답 조회 (디버깅용)
     */
    public String getRawResponse(String date, String categoryCode) {
        log.info("KAMIS API raw response query - date: {}, category: {}", date, categoryCode);

        try {
            // 날짜가 null이면 오늘 날짜 사용
            String targetDate = (date != null && !date.isEmpty())
                    ? date
                    : LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));

            String url = UriComponentsBuilder.fromHttpUrl(apiUrl)
                    .queryParam("action", "dailyPriceByCategoryList")
                    .queryParam("p_cert_key", certKey)
                    .queryParam("p_cert_id", certId)
                    .queryParam("p_returntype", "json")
                    .queryParam("p_regday", targetDate)
                    .queryParam("p_itemcategorycode", categoryCode)
                    .queryParam("p_convert_kg_yn", "Y")
                    .build()
                    .toUriString();

            log.info("KAMIS API 요청 URL: {}", url);

            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);

            return response.getBody();

        } catch (Exception e) {
            log.error("KAMIS API raw response query failed", e);
            return "ERROR: " + e.getMessage();
        }
    }

    /**
     * 기간별 품목 가격 조회 (periodProductList)
     * 소매가격, 상품등급, 서울지역 기준
     *
     * @param startDay 시작일 (yyyy-MM-dd)
     * @param endDay 종료일 (yyyy-MM-dd)
     * @param itemCategoryCode 부류코드 (200:채소류 등)
     * @param itemCode 품목코드
     * @param kindCode 품종코드
     * @return JSON 응답 문자열
     */
    @Override
    public String getPeriodProductList(String startDay, String endDay, String itemCategoryCode,
                                         String itemCode, String kindCode) {
        log.info("KAMIS API periodProductList call - period: {} ~ {}, category: {}, item: {}, kind: {}",
                startDay, endDay, itemCategoryCode, itemCode, kindCode);

        try {
            String url = UriComponentsBuilder.fromHttpUrl(apiUrl)
                    .queryParam("action", "periodProductList")
                    .queryParam("p_cert_key", certKey)
                    .queryParam("p_cert_id", certId)
                    .queryParam("p_returntype", "json")
                    .queryParam("p_startday", startDay)
                    .queryParam("p_endday", endDay)
                    .queryParam("p_productclscode", "01")  // 소매
                    .queryParam("p_itemcategorycode", itemCategoryCode)
                    .queryParam("p_itemcode", itemCode)
                    .queryParam("p_kindcode", kindCode)
                    .queryParam("p_productrankcode", "04")  // 상품 등급
                    .queryParam("p_countrycode", "1101")    // 서울
                    .queryParam("p_convert_kg_yn", "Y")
                    .build()
                    .toUriString();

            log.debug("KAMIS API request URL: {}", url);

            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);

            log.info("KAMIS API periodProductList call success");
            return response.getBody();

        } catch (Exception e) {
            log.error("KAMIS API periodProductList call failed", e);
            return null;
        }
    }

    /**
     * 카테고리별 일일 가격 목록 조회 (dailyPriceByCategoryList)
     * 소매가격, 서울지역 기준
     *
     * @param categoryCode 부류코드
     * @param regDay 조회일 (yyyy-MM-dd), null이면 오늘
     * @return JSON 응답 문자열
     */
    @Override
    public String getDailyPriceByCategoryList(String categoryCode, String regDay) {
        log.info("KAMIS API dailyPriceByCategoryList call - category: {}, date: {}", categoryCode, regDay);

        try {
            if (regDay == null || regDay.isEmpty()) {
                regDay = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            }

            String url = UriComponentsBuilder.fromHttpUrl(apiUrl)
                    .queryParam("action", "dailyPriceByCategoryList")
                    .queryParam("p_cert_key", certKey)
                    .queryParam("p_cert_id", certId)
                    .queryParam("p_returntype", "json")
                    .queryParam("p_product_cls_code", "01")  // 소매
                    .queryParam("p_item_category_code", categoryCode)
                    .queryParam("p_country_code", "1101")    // 서울
                    .queryParam("p_regday", regDay)
                    .queryParam("p_convert_kg_yn", "Y")
                    .build()
                    .toUriString();

            log.debug("KAMIS API request URL: {}", url);

            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);

            log.info("KAMIS API dailyPriceByCategoryList call success");
            return response.getBody();

        } catch (Exception e) {
            log.error("KAMIS API dailyPriceByCategoryList call failed", e);
            return null;
        }
    }
}


