package com.fom.boot.app.pricehistory.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fom.boot.app.pricehistory.dto.PriceTrendResponse;
import com.fom.boot.domain.pricehistory.model.service.PriceHistoryService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/price")
@RequiredArgsConstructor
public class PriceHistoryController {

private final PriceHistoryService priceHistoryService;
    
	/**
	 * 식자재별 가격 변동 추이 조회 (시계열)
	 * 
	 * @param ingredientId 식자재 ID
	 * @param period 조회 기간 (DAILY, WEEKLY, MONTHLY)
	 * @param startDate 시작 날짜 (선택)
	 * @param endDate 종료 날짜 (선택)
	 * @param priceType 가격 유형 (도매/소매, 선택)
	 * @param region 조사 지역 (선택)
	 * @return 가격 추이 및 등락률 정보
	 */
	@GetMapping("/trend/{ingredientId}")
	public ResponseEntity<PriceTrendResponse> getPriceTrend(
	        @PathVariable int ingredientId,
	        @RequestParam(defaultValue = "DAILY") String period,
	        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
	        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
	        @RequestParam(required = false) String priceType,
	        @RequestParam(required = false) String region) {
	    
	    PriceTrendResponse response = priceHistoryService.getPriceTrend(
	            ingredientId, period, startDate, endDate, priceType, region
	    );
	    
	    return ResponseEntity.ok(response);
	}
	
	/**
	 * 최근 가격 정보 및 등락률 조회 (간편 조회)
	 * 
	 * @param ingredientId 식자재 ID
	 * @param priceType 가격 유형 (선택)
	 * @param region 조사 지역 (선택)
	 * @return 최근 가격 및 1주일/1개월 전 대비 등락률
	 */
	@GetMapping("/latest/{ingredientId}")
	public ResponseEntity<PriceTrendResponse> getLatestPrice(
	        @PathVariable int ingredientId,
	        @RequestParam(required = false) String priceType,
	        @RequestParam(required = false) String region) {
	    
	    PriceTrendResponse response = priceHistoryService.getLatestPriceWithChanges(
	            ingredientId, priceType, region
	    );
	    
	    return ResponseEntity.ok(response);
	}
	
	/**
	 * 여러 식자재의 최근 가격 정보 일괄 조회
	 * 
	 * @param ingredientIds 식자재 ID 목록 (콤마로 구분)
	 * @param priceType 가격 유형 (선택)
	 * @param region 조사 지역 (선택)
	 * @return 식자재별 최근 가격 및 등락률 목록
	 */
	@GetMapping("/latest/batch")
	public ResponseEntity<List<PriceTrendResponse>> getLatestPricesBatch(
	        @RequestParam String ingredientIds,
	        @RequestParam(required = false) String priceType,
	        @RequestParam(required = false) String region) {
	    
	    List<PriceTrendResponse> responses = priceHistoryService.getLatestPricesBatch(
	            ingredientIds, priceType, region
	    );
	    
	    return ResponseEntity.ok(responses);
	}
	
}
