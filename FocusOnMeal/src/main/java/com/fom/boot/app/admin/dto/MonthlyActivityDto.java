package com.fom.boot.app.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

/**
 * 월별 활동 추이 DTO
 */
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyActivityDto {
	private String month;    // 월 (Jan, Feb, Mar...)
    private int members;     // 해당 월의 누적 회원 수
}
