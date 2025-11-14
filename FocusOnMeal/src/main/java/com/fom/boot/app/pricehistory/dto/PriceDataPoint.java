package com.fom.boot.app.pricehistory.dto;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 가격 데이터 포인트 (시계열 데이터)
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PriceDataPoint {
    private LocalDate date;         // 날짜
    private int price;              // 가격
    private String priceType;       // 가격 유형
    private String region;          // 지역
    private int dataCount;          // 해당 기간의 데이터 개수 (평균 계산시)
}