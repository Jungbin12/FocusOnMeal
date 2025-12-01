package com.fom.boot.domain.alert.model.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import com.fom.boot.domain.alert.model.vo.PriceAlert;

public interface PriceAlertService {

	PriceAlert getMyPriceAlert(String name, int ingredientId);

	void setPriceAlert(String name, int ingredientId, BigDecimal targetPrice);

	void checkAndNotifyPrice(int ingredientId, String ingredientName, BigDecimal currentPrice);

	List<PriceAlert> getAllPriceAlerts(String name, int ingredientId);

	void addPriceAlert(String name, int ingredientId, BigDecimal targetPrice, String alertType);

	void deletePriceAlert(String name, int ingredientId, int alertId);

	void deleteAllPriceAlerts(String name, int ingredientId);

	/**
	 * 사용자의 모든 지정가 알림 설정 조회 (마이페이지용)
	 * @param memberId 회원 ID
	 * @return 알림 설정 목록 (식재료명, 지정가, 현재가 포함)
	 */
	List<Map<String, Object>> getAllAlertsByMember(String memberId);

}
