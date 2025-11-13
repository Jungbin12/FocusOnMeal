package com.fom.boot.domain.mypage.model.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface MyPageMapper {

	int logicalDeleteMealPlan(@Param("planId") int planId);

}
