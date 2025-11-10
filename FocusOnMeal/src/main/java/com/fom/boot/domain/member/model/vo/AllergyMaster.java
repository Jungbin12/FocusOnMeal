package com.fom.boot.domain.member.model.vo;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class AllergyMaster {
	private int allergyId; 			// ALLERGY_ID (알레르기 ID)
	private String allergyName; 	// ALLERGY_NAME(알레르기 명칭)
	private String category; 		// CATEGORY(분류)
}
