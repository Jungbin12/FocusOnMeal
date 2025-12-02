package com.fom.boot.domain.admin.model.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.fom.boot.app.admin.dto.DashboardStatsDto;
import com.fom.boot.app.admin.dto.MonthlyActivityDto;
import com.fom.boot.domain.admin.model.mapper.AdminMapper;
import com.fom.boot.domain.admin.model.service.AdminService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminserviceImpl implements AdminService {
	
	private final AdminMapper adminMapper;
	
	@Override
    public DashboardStatsDto getDashboardStats() {
        // 각 통계 데이터 조회
        int totalMembers = adminMapper.getTotalMembers();
        int totalIngredients = adminMapper.getTotalIngredients();
        int totalMealPlans = adminMapper.getTotalMealPlans();
        
        return new DashboardStatsDto(totalMembers, totalIngredients, totalMealPlans);
    }

    @Override
    public List<MonthlyActivityDto> getMonthlyActivity() {
        return adminMapper.getMonthlyActivity();
    }

    @Override
    public List<MonthlyActivityDto> getMonthlyNewMembers() {
        return adminMapper.getMonthlyNewMembers();
    }

    @Override
    public List<MonthlyActivityDto> getMonthlyMealPlans() {
        return adminMapper.getMonthlyMealPlans();
    }
}
