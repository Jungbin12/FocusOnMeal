package com.fom.boot.domain.ingredient.model.service;

import java.util.Map;

/**
 * 식자재 가격 조회 서비스
 * 다층 Fallback 전략: DB 조회 → 기본 가격 상수
 */
public interface PriceService {

	/**
	 * 식자재 가격 조회 (Fallback 포함)
	 *
	 * @param ingredientName 식자재명
	 * @return 가격 (원/kg), 조회 실패 시 null
	 */
	Integer getPrice(String ingredientName);

	/**
	 * 여러 식자재의 가격 조회
	 *
	 * @param ingredientNames 식자재명 배열
	 * @return 식자재명-가격 맵
	 */
	Map<String, Integer> getPrices(String... ingredientNames);

	/**
	 * 가격 저장 (스케줄러에서 사용)
	 *
	 * @param ingredientName 식자재명
	 * @param price 가격
	 * @param priceType 가격 유형 (소매/도매)
	 * @param region 지역
	 * @return 저장 성공 여부
	 */
	boolean savePrice(String ingredientName, Integer price, String priceType, String region);
}