package com.fom.boot.domain.mypage.model.service;

import java.util.List;
import java.util.Map;

import com.fom.boot.app.mypage.dto.MyPageDashboardDTO;
import com.fom.boot.app.pricehistory.dto.PriceTrendResponse;
import com.fom.boot.common.pagination.PageInfo;
import com.fom.boot.domain.meal.model.vo.MealPlan;

public interface MyPageService {

	int logicalDeleteMealPlan(int planId);

	MyPageDashboardDTO getDashboardData(String memberId);

	PriceTrendResponse getPriceChartData(int ingredientId, int days);

	boolean updateMemberAllergies(String memberId, List<?> allergyIds);

	List<Integer> getMemberAllergies(String memberId);

	void saveUserAllergies(String memberId, List<Integer> allergyIds);

	Object getUserAllergyIds(String memberId);

	Object getAllAllergies();

	// 내 식단 페이지
	Map<String, Object> getMyMealPlans(String memberId, int page);

	MealPlan getMealPlanDetail(int planId);

}
