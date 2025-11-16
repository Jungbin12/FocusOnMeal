package com.fom.boot.domain.meal.model.service.impl;

import com.fom.boot.domain.meal.model.service.SeoulPriceApiService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

/**
 * 서울시 생필품 가격 정보 API 호출 서비스
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SeoulPriceApiServiceImpl implements SeoulPriceApiService {
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${api.seoul.key}")
    private String apiKey;

    @Value("${api.seoul.url}")
    private String apiUrl;

    /**
     * API 연결 테스트
     */
    @Override
    public String testConnection() {
        log.info("서울시 생필품 가격 API 연결 테스트 시작");

        try {
            // 1~5번 데이터만 조회
            String url = String.format("%s/%s/json/ListNecessariesPricesService/1/5/",
                    apiUrl, apiKey);

            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            JsonNode root = objectMapper.readTree(response.getBody());

            String code = root.path("ListNecessariesPricesService").path("RESULT").path("CODE").asText();
            String message = root.path("ListNecessariesPricesService").path("RESULT").path("MESSAGE").asText();

            if ("INFO-000".equals(code)) {
                int totalCount = root.path("ListNecessariesPricesService").path("list_total_count").asInt();
                log.info("서울시 API 연결 성공 - 전체 {}개 품목", totalCount);
                return String.format("연결 성공 - %s (전체 %d개 품목)", message, totalCount);
            } else {
                log.warn("서울시 API 응답 코드: {}, 메시지: {}", code, message);
                return String.format("응답 코드: %s, 메시지: %s", code, message);
            }

        } catch (Exception e) {
            log.error("서울시 API 연결 테스트 실패", e);
            return "연결 실패: " + e.getMessage();
        }
    }

    /**
     * 특정 품목의 평균 가격 조회
     */
    @Override
    public Integer getAveragePrice(String itemName) {
        log.info("서울시 API 호출 - 품목: {}", itemName);

        try {
            // 최대 1000개까지 조회 (페이징 필요시 확장 가능)
            String url = String.format("%s/%s/json/ListNecessariesPricesService/1/1000/",
                    apiUrl, apiKey);

            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            JsonNode root = objectMapper.readTree(response.getBody());

            String code = root.path("ListNecessariesPricesService").path("RESULT").path("CODE").asText();
            if (!"INFO-000".equals(code)) {
                log.warn("서울시 API 오류 - 코드: {}", code);
                return null;
            }

            JsonNode rows = root.path("ListNecessariesPricesService").path("row");
            if (!rows.isArray() || rows.isEmpty()) {
                log.warn("서울시 API - 데이터 없음");
                return null;
            }

            // 품목명으로 검색하여 kg당 평균 단가 계산
            int sum = 0;
            int count = 0;

            for (JsonNode row : rows) {
                String aName = row.path("A_NAME").asText();
                String aPriceStr = row.path("A_PRICE").asText();

                // 품목명에 검색어가 포함되어 있고, 가격이 0이 아닌 경우
                if (aName.contains(itemName) && !"0".equals(aPriceStr)) {
                    try {
                        int price = Integer.parseInt(aPriceStr);
                        if (price > 0) {
                            // kg당 단가로 환산
                            Integer pricePerKg = calculatePricePerKg(aName, price);
                            if (pricePerKg != null) {
                                sum += pricePerKg;
                                count++;
                            }
                        }
                    } catch (NumberFormatException e) {
                        // 숫자가 아닌 경우 무시
                    }
                }
            }

            if (count > 0) {
                int avgPrice = sum / count;
                log.info("서울시 API 호출 성공 - 품목: {}, 평균 kg당 단가: {}원/kg ({}개 항목)",
                        itemName, avgPrice, count);
                return avgPrice;
            } else {
                log.warn("서울시 API - 품목을 찾을 수 없음: {}", itemName);
                return null;
            }

        } catch (Exception e) {
            log.error("서울시 API 호출 실패 - 품목: {}", itemName, e);
            return null;
        }
    }

    /**
     * 여러 품목의 평균 가격 조회
     */
    @Override
    public Map<String, Integer> getAveragePrices(String... itemNames) {
        Map<String, Integer> result = new HashMap<>();

        if (itemNames == null || itemNames.length == 0) {
            return result;
        }

        try {
            // 최대 1000개까지 조회
            String url = String.format("%s/%s/json/ListNecessariesPricesService/1/1000/",
                    apiUrl, apiKey);

            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            JsonNode root = objectMapper.readTree(response.getBody());

            String code = root.path("ListNecessariesPricesService").path("RESULT").path("CODE").asText();
            if (!"INFO-000".equals(code)) {
                log.warn("서울시 API 오류 - 코드: {}", code);
                return result;
            }

            JsonNode rows = root.path("ListNecessariesPricesService").path("row");
            if (!rows.isArray() || rows.isEmpty()) {
                log.warn("서울시 API - 데이터 없음");
                return result;
            }

            // 각 품목별로 가격 합계와 개수 저장
            Map<String, Integer> sumMap = new HashMap<>();
            Map<String, Integer> countMap = new HashMap<>();

            for (String itemName : itemNames) {
                sumMap.put(itemName, 0);
                countMap.put(itemName, 0);
            }

            // 모든 행을 순회하며 품목별 가격 집계
            for (JsonNode row : rows) {
                String aName = row.path("A_NAME").asText();
                String aPriceStr = row.path("A_PRICE").asText();

                for (String itemName : itemNames) {
                    if (aName.contains(itemName) && !"0".equals(aPriceStr)) {
                        try {
                            int price = Integer.parseInt(aPriceStr);
                            if (price > 0) {
                                // kg당 단가로 환산
                                Integer pricePerKg = calculatePricePerKg(aName, price);
                                if (pricePerKg != null) {
                                    sumMap.put(itemName, sumMap.get(itemName) + pricePerKg);
                                    countMap.put(itemName, countMap.get(itemName) + 1);
                                }
                            }
                        } catch (NumberFormatException e) {
                            // 숫자가 아닌 경우 무시
                        }
                    }
                }
            }

            // 평균 계산
            for (String itemName : itemNames) {
                int count = countMap.get(itemName);
                if (count > 0) {
                    int avgPrice = sumMap.get(itemName) / count;
                    result.put(itemName, avgPrice);
                    log.debug("서울시 API - 품목: {}, 평균: {}원 ({}개)", itemName, avgPrice, count);
                }
            }

            log.info("서울시 API 일괄 조회 성공 - {}개 품목 중 {}개 발견",
                    itemNames.length, result.size());

        } catch (Exception e) {
            log.error("서울시 API 일괄 조회 실패", e);
        }

        return result;
    }

    /**
     * 품목명에서 중량을 추출하여 kg당 단가로 환산
     *
     * @param itemName 품목명 (예: " 쌀(이천쌀) 4kg 1포", "감자 100g", "계란 10개")
     * @param price 가격
     * @return kg당 단가, 환산 불가시 null
     */
    private Integer calculatePricePerKg(String itemName, int price) {
        try {
            // kg 단위 추출 (예: "4kg", "10kg", "20kg")
            if (itemName.contains("kg")) {
                String[] parts = itemName.split("kg");
                if (parts.length > 0) {
                    // "쌀(이천쌀) 4" -> "4" 추출
                    String weightStr = parts[0].trim();
                    // 마지막 숫자 부분만 추출
                    String[] tokens = weightStr.split("\\s+");
                    for (int i = tokens.length - 1; i >= 0; i--) {
                        String token = tokens[i].replaceAll("[^0-9.]", "");
                        if (!token.isEmpty()) {
                            try {
                                double weight = Double.parseDouble(token);
                                if (weight > 0) {
                                    int pricePerKg = (int) (price / weight);
                                    log.debug("kg 환산: {} -> {}원/kg ({}kg, {}원)",
                                            itemName, pricePerKg, weight, price);
                                    return pricePerKg;
                                }
                            } catch (NumberFormatException e) {
                                // 다음 토큰 시도
                            }
                        }
                    }
                }
            }

            // g 단위 추출 (예: "100g", "500g")
            if (itemName.contains("g") && !itemName.contains("kg")) {
                String[] parts = itemName.split("g");
                if (parts.length > 0) {
                    String weightStr = parts[0].trim();
                    String[] tokens = weightStr.split("\\s+");
                    for (int i = tokens.length - 1; i >= 0; i--) {
                        String token = tokens[i].replaceAll("[^0-9.]", "");
                        if (!token.isEmpty()) {
                            try {
                                double weightGrams = Double.parseDouble(token);
                                if (weightGrams > 0) {
                                    double weightKg = weightGrams / 1000.0;
                                    int pricePerKg = (int) (price / weightKg);
                                    log.debug("g->kg 환산: {} -> {}원/kg ({}g, {}원)",
                                            itemName, pricePerKg, weightGrams, price);
                                    return pricePerKg;
                                }
                            } catch (NumberFormatException e) {
                                // 다음 토큰 시도
                            }
                        }
                    }
                }
            }

            // 개수 단위 (예: "계란 10개") - 계란 1개 = 약 60g로 가정
            if (itemName.contains("계란") && itemName.contains("개")) {
                String[] parts = itemName.split("개");
                if (parts.length > 0) {
                    String countStr = parts[0].trim();
                    String[] tokens = countStr.split("\\s+");
                    for (int i = tokens.length - 1; i >= 0; i--) {
                        String token = tokens[i].replaceAll("[^0-9]", "");
                        if (!token.isEmpty()) {
                            try {
                                int count = Integer.parseInt(token);
                                if (count > 0) {
                                    // 계란 1개 = 60g, 1kg = 약 16.7개
                                    double weightKg = (count * 60.0) / 1000.0;
                                    int pricePerKg = (int) (price / weightKg);
                                    log.debug("계란 환산: {} -> {}원/kg ({}개, {}원)",
                                            itemName, pricePerKg, count, price);
                                    return pricePerKg;
                                }
                            } catch (NumberFormatException e) {
                                // 다음 토큰 시도
                            }
                        }
                    }
                }
            }

            // 마리 단위 (생선 등) - 환산 어려우므로 그대로 반환
            if (itemName.contains("마리") || itemName.contains("손")) {
                log.debug("마리/손 단위는 환산 불가: {}", itemName);
                return price; // 그대로 사용
            }

            // 기타 단위 없는 경우 그대로 반환
            log.debug("단위 추출 실패, 원가격 사용: {} ({}원)", itemName, price);
            return price;

        } catch (Exception e) {
            log.warn("kg 환산 실패 - 품목: {}, 에러: {}", itemName, e.getMessage());
            return null;
        }
    }
}