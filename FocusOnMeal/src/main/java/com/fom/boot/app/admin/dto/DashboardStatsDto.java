package com.fom.boot.app.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

/**
 * 대시보드 통계 DTO
 */
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDto {
	private int totalMembers;        // 전체 회원 수
    private int totalIngredients;    // 전체 식자재 수
    private int totalMealPlans;      // 전체 회원 활동 수 (식단 수)
}
