package com.fom.boot.domain.meal.model.service.impl;

import com.fom.boot.domain.meal.model.service.ChamgaApiService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

/**
 * 한국소비자원 참가격 API 호출 서비스
 * 축산물, 수산물, 가공식품 가격 정보 조회
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ChamgaApiServiceImpl implements ChamgaApiService {
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${api.chamga.key}")
    private String apiKey;

    @Value("${api.chamga.url}")
    private String apiUrl;

    /**
     * 상품명으로 소매가격 조회
     *
     * @param productName 상품명 (예: 돼지고기 삼겹살, 고등어, 두부 등)
     * @return 평균 소매가격 (원)
     */
    public Integer getRetailPrice(String productName) {
        log.info("참가격 API 호출 - 상품명: {}", productName);

        try {
            // URL 직접 생성 (샘플코드 방식)
            String url = apiUrl + "/getProductInfoSvc.do?serviceKey=" + apiKey;

            log.debug("참가격 API 요청 URL: {}", url);

            // API 호출
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);

            // 전체 목록에서 상품명으로 필터링하여 가격 파싱
            Integer price = parseAveragePriceByName(response.getBody(), productName);

            if (price != null) {
                log.info("참가격 API 호출 성공 - 상품: {}, 가격: {}원", productName, price);
            } else {
                log.warn("참가격 API - 상품을 찾을 수 없음: {}", productName);
            }

            return price;

        } catch (Exception e) {
            log.error("참가격 API 호출 실패 - 상품: {}", productName, e);
            return null;
        }
    }

    /**
     * 상품 정보 전체 조회 (가격, 업소 등)
     *
     * @param productName 상품명 (전체 조회 시 null 가능)
     * @return XML 형식의 상품 정보
     */
    public String getProductInfo(String productName) {
        log.info("참가격 API 상품정보 조회 - 상품명: {}", productName);

        try {
            // URL 직접 생성 (샘플코드 방식)
            String url = apiUrl + "/getProductInfoSvc.do?serviceKey=" + apiKey;

            log.debug("참가격 API 요청 URL: {}", url);

            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);

            return response.getBody();

        } catch (Exception e) {
            log.error("참가격 API 상품정보 조회 실패", e);
            return null;
        }
    }

    /**
     * API 응답에서 상품명으로 필터링하여 평균 가격 계산 (XML 파싱)
     */
    private Integer parseAveragePriceByName(String responseBody, String productName) {
        try {
            // XML 파서 생성
            XmlMapper xmlMapper = new XmlMapper();
            JsonNode root = xmlMapper.readTree(responseBody);

            // 응답 구조 확인
            JsonNode items = root.path("list");  // list 또는 item 확인 필요
            if (!items.isArray() || items.size() == 0) {
                // 다른 구조 시도
                items = root.path("item");
            }

            if (!items.isArray() || items.size() == 0) {
                log.warn("참가격 API - 응답 데이터 없음");
                log.debug("응답 본문: {}", responseBody.substring(0, Math.min(500, responseBody.length())));
                return null;
            }

            // 상품명으로 필터링 후 평균 가격 계산
            int totalPrice = 0;
            int count = 0;

            for (JsonNode item : items) {
                // 상품명 확인
                String goodName = item.path("goodName").asText();

                // 상품명이 일치하는 경우만 처리
                if (goodName.contains(productName) || productName.contains(goodName)) {
                    // 가격 필드명 확인 (goodPrice, price, selngPrice 등)
                    JsonNode priceNode = item.path("goodPrice");
                    if (priceNode.isMissingNode()) {
                        priceNode = item.path("price");
                    }
                    if (priceNode.isMissingNode()) {
                        priceNode = item.path("selngPrice");
                    }

                    if (!priceNode.isMissingNode() && priceNode.isNumber()) {
                        totalPrice += priceNode.asInt();
                        count++;
                    } else if (!priceNode.isMissingNode()) {
                        String priceStr = priceNode.asText().replace(",", "");
                        try {
                            totalPrice += Integer.parseInt(priceStr);
                            count++;
                        } catch (NumberFormatException e) {
                            log.debug("가격 파싱 실패: {}", priceStr);
                        }
                    }
                }
            }

            if (count > 0) {
                int avgPrice = totalPrice / count;
                log.info("상품 '{}' - {}개 매장 평균 가격: {}원", productName, count, avgPrice);
                return avgPrice;
            }

            return null;

        } catch (Exception e) {
            log.error("참가격 응답 파싱 실패", e);
            log.debug("응답 본문: {}", responseBody.substring(0, Math.min(500, responseBody.length())));
            return null;
        }
    }

    /**
     * API 연결 테스트 (XML 파싱)
     */
    public String testConnection() {
        log.info("참가격 API 연결 테스트 시작");

        try {
            // 전체 상품 목록 조회 (goodId 파라미터 없이)
            // URL 직접 생성 (UriComponentsBuilder가 인코딩 문제를 일으킬 수 있음)
            String url = apiUrl + "/getProductInfoSvc.do?serviceKey=" + apiKey;

            log.info("참가격 API 요청 URL: {}", url);

            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                String responseBody = response.getBody();
                log.debug("참가격 API 응답 (처음 500자): {}", responseBody.substring(0, Math.min(500, responseBody.length())));

                // XML 파서 생성
                XmlMapper xmlMapper = new XmlMapper();
                JsonNode root = xmlMapper.readTree(responseBody);

                // 응답 구조 확인 (list 또는 item)
                JsonNode items = root.path("list");
                if (!items.isArray() || items.size() == 0) {
                    items = root.path("item");
                }

                if (items.isArray() && items.size() > 0) {
                    log.info("참가격 API 연결 성공 - 품목 수: {}", items.size());

                    // 첫 번째 상품명 출력
                    String firstGoodName = items.get(0).path("goodName").asText();
                    return String.format("연결 성공 - %d개 품목 조회됨 (예: %s)", items.size(), firstGoodName);
                } else {
                    log.warn("참가격 API 연결 성공하나 데이터 구조 확인 필요");
                    return "연결 성공하나 데이터 형식 확인 필요: " + responseBody.substring(0, Math.min(200, responseBody.length()));
                }
            }

            return "연결 실패";

        } catch (Exception e) {
            log.error("참가격 API 연결 테스트 실패", e);
            return "연결 실패: " + e.getMessage();
        }
    }
}
