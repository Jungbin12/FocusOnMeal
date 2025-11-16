package com.fom.boot.domain.meal.model.service;

import java.util.Map;

/**
 * 서울시 생필품 가격 정보 API 서비스
 */
public interface SeoulPriceApiService {
    /**
     * API 연결 테스트
     */
    String testConnection();

    /**
     * 특정 품목의 평균 가격 조회
     * @param itemName 품목명
     * @return 가격 (원/kg), 없으면 null
     */
    Integer getAveragePrice(String itemName);

    /**
     * 여러 품목의 평균 가격 조회
     * @param itemNames 품목명 배열
     * @return 품목명-가격 맵
     */
    Map<String, Integer> getAveragePrices(String... itemNames);
}