package com.fom.boot.domain.alert.model.service.impl;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fom.boot.domain.alert.model.mapper.AlertMapper;
import com.fom.boot.domain.alert.model.service.AlertService;
import com.fom.boot.domain.alert.model.vo.NotificationLog;
import com.fom.boot.domain.alert.model.vo.SafetyAlert;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AlertServiceImpl implements AlertService {

    private final AlertMapper alertMapper;

    @Override
    public List<Map<String, Object>> getNotificationsByMemberId(String memberId) {
        try {
            // NOTIFICATION_LOG와 SAFETY_ALERT_MASTER를 조인하여 제목 포함
            List<Map<String, Object>> notifications = alertMapper.selectNotificationsByMemberId(memberId);
            return notifications;
        } catch (Exception e) {
            log.error("알림 목록 조회 실패: memberId={}", memberId, e);
            throw new RuntimeException("알림 목록 조회에 실패했습니다.", e);
        }
    }
    
    @Override
    @Transactional
    public boolean markNotificationAsRead(int notificationId, String memberId) {
        try {
            int result = alertMapper.updateNotificationReadStatus(notificationId, memberId);
            return result > 0;
        } catch (Exception e) {
            log.error("알림 읽음 처리 실패: notificationId={}, memberId={}", notificationId, memberId, e);
            throw new RuntimeException("알림 읽음 처리에 실패했습니다.", e);
        }
    }
    
    @Override
    public int getUnreadNotificationCount(String memberId) {
        try {
            return alertMapper.selectUnreadNotificationCount(memberId);
        } catch (Exception e) {
            log.error("읽지 않은 알림 개수 조회 실패: memberId={}", memberId, e);
            return 0;
        }
    }
    
    @Override
    public Map<String, Object> getSafetyAlertSettings(String memberId) {
        try {
            Map<String, Object> settings = alertMapper.selectSafetyAlertSettings(memberId);
            
            // 설정이 없으면 기본값으로 생성
            if (settings == null) {
                alertMapper.insertDefaultSafetyAlertSettings(memberId);
                settings = new HashMap<>();
                settings.put("notificationEnabled", "N");
            }
            
            return settings;
        } catch (Exception e) {
            log.error("안전 알림 설정 조회 실패: memberId={}", memberId, e);
            throw new RuntimeException("안전 알림 설정 조회에 실패했습니다.", e);
        }
    }
    
    @Override
    @Transactional
    public boolean updateSafetyAlertSettings(String memberId, String notificationEnabled) {
        try {
            // 기존 설정이 있는지 확인
            Map<String, Object> existing = alertMapper.selectSafetyAlertSettings(memberId);
            
            int result;
            if (existing == null) {
                // 없으면 새로 생성
                result = alertMapper.insertSafetyAlertSettings(memberId, notificationEnabled);
            } else {
                // 있으면 업데이트
                result = alertMapper.updateSafetyAlertSettings(memberId, notificationEnabled);
            }
            
            return result > 0;
        } catch (Exception e) {
            log.error("안전 알림 설정 업데이트 실패: memberId={}, enabled={}", memberId, notificationEnabled, e);
            throw new RuntimeException("안전 알림 설정 업데이트에 실패했습니다.", e);
        }
    }
    
    @Override
    @Transactional
    public void createSafetyAlertNotifications(int alertId) {
        try {
            // 공표 정보 조회
            SafetyAlert alert = alertMapper.selectSafetyAlertById(alertId);
            
            if (alert == null) {
                log.error("공표 정보를 찾을 수 없습니다: alertId={}", alertId);
                return;
            }
            
            // 알림 수신 설정이 활성화된 회원 목록 조회
            List<String> memberIds = alertMapper.selectMembersWithSafetyAlertEnabled();
            
            // 각 회원에게 알림 생성
            for (String memberId : memberIds) {
                String message = String.format("[%s] %s - %s", 
                    alert.getNation(), 
                    alert.getHazardType(), 
                    alert.getDescription());
                
                alertMapper.insertNotificationLog(memberId, "위험공표", message, alertId);
                
                log.info("안전 알림 생성: memberId={}, alertId={}", memberId, alertId);
            }
            
            log.info("안전 알림 발송 완료: alertId={}, 수신자 수={}", alertId, memberIds.size());
            
        } catch (Exception e) {
            log.error("안전 알림 생성 실패: alertId={}", alertId, e);
            throw new RuntimeException("안전 알림 생성에 실패했습니다.", e);
        }
    }
}
