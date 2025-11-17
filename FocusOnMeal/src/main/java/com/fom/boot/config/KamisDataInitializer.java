package com.fom.boot.config;

import com.fom.boot.domain.ingredient.model.service.KamisDataSyncService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

/**
 * 서버 시작 시 KAMIS 데이터 자동 동기화
 * 오늘 가격 데이터가 없으면 자동으로 동기화
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class KamisDataInitializer implements ApplicationRunner {

    private final KamisDataSyncService kamisDataSyncService;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        log.info("========== Server startup: KAMIS data auto sync started ==========");

        try {
            String result = kamisDataSyncService.syncAllCategoriesAndGetResult();
            log.info("KAMIS data sync result: {}", result);
        } catch (Exception e) {
            log.error("KAMIS data auto sync failed", e);
            // 동기화 실패해도 서버는 정상 구동
        }

        log.info("========== KAMIS data auto sync completed ==========");
    }
}