package com.fom.boot.domain.admin.model.service;

import java.util.List;

import com.fom.boot.app.admin.dto.DashboardStatsDto;
import com.fom.boot.app.admin.dto.MonthlyActivityDto;

public interface AdminService {
	/**
     * 대시보드 통계 데이터 조회
     * @return 회원 수, 식자재 수, 식단 수
     */
    DashboardStatsDto getDashboardStats();
    
    /**
     * 월별 회원 가입 추이 데이터 조회 (누적)
     * @return 월별 누적 회원 수
     */
    List<MonthlyActivityDto> getMonthlyActivity();
    
    /**
     * 월별 신규 회원 수 조회 (증가량)
     * @return 월별 신규 가입 회원 수
     */
    List<MonthlyActivityDto> getMonthlyNewMembers();
    
    /**
     * 월별 식단 생성 추이 조회 (누적)
     * @return 월별 누적 식단 수
     */
    List<MonthlyActivityDto> getMonthlyMealPlans();
}
