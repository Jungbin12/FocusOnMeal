package com.fom.boot.app.pricehistory.dto;

import java.time.LocalDate;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 가격 변동 추이 응답 DTO
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PriceTrendResponse {
    private int ingredientId;               // 식자재 ID
    private String ingredientName;          // 식자재명
    private String category;                // 분류
    private String standardUnit;            // 기준 단위
    
    private String period;                  // 조회 기간 (DAILY/WEEKLY/MONTHLY)
    private LocalDate startDate;            // 시작 날짜
    private LocalDate endDate;              // 종료 날짜
    
    private String priceType;               // 가격 유형 (도매/소매)
    private String region;                  // 조사 지역
    
    private List<PriceDataPoint> dataPoints;  // 시계열 데이터 포인트
    private PriceChangeRate changeRate;       // 등락률 정보
}
