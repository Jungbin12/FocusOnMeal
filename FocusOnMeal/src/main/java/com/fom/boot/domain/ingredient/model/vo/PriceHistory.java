package com.fom.boot.domain.ingredient.model.vo;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class PriceHistory {
	private int 			priceHistoryId;     // 가격 이력 ID 	(PK)
    private int 			ingredientId;       // 식자재 아이디 	(FK)
    private int 			priceValue;       	// 해당 일자의 가격
    private String 			priceType;        	// 가격 유형 		(도매/소매)
    private String 			region;           	// 조사 지역
    private LocalDateTime 	collectedDate; 		// 가격 수집 날짜
}
