package com.fom.boot.domain.ingredient.model.vo;

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
public class Ingredient {
	private int 	ingredientId;      	// 식자재 아이디 	(PK)
    private String 	name;            	// 표준 품목명
    private String 	category;        	// 분류			(예: 곡류, 육류, 난류)
    private String 	standardUnit;    	// 기준 단위 		(예: kg 등)
}
