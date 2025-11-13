package com.fom.boot.domain.mypage.model.service.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fom.boot.domain.mypage.model.mapper.MyPageMapper;
import com.fom.boot.domain.mypage.model.service.MyPageService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MyPageServiceImpl implements MyPageService {
	
	private final MyPageMapper mMapper;

	@Override
	@Transactional
	public int logicalDeleteMealPlan(int planId) {
		return mMapper.logicalDeleteMealPlan(planId);
	}
}
