package com.fom.boot.domain.admin.model.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.fom.boot.app.admin.dto.MonthlyActivityDto;

@Mapper
public interface AdminMapper {
	/**
     * 전체 회원 수 조회 (활성 회원만)
     */
    int getTotalMembers();
    
    /**
     * 전체 식자재 수 조회
     */
    int getTotalIngredients();
    
    /**
     * 전체 식단 수 조회 (삭제되지 않은 식단만)
     */
    int getTotalMealPlans();
    
    /**
     * 월별 회원 가입 추이 조회 (누적)
     */
    List<MonthlyActivityDto> getMonthlyActivity();
    
    /**
     * 월별 신규 회원 수 조회 (증가량)
     */
    List<MonthlyActivityDto> getMonthlyNewMembers();
    
    /**
     * 월별 식단 생성 추이 조회 (누적)
     */
    List<MonthlyActivityDto> getMonthlyMealPlans();
}
