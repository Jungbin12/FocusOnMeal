package com.fom.boot.domain.ingredient.model.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.fom.boot.domain.ingredient.model.vo.FavoriteIngredient;
import com.fom.boot.domain.ingredient.model.vo.Ingredient;

@Mapper
public interface IngredientMapper {

	// 찜 등록 및 해제
	int insertFavorite(FavoriteIngredient favorite);
	int deleteFavorite(@Param("memberId") String memberId, 
					   @Param("ingredientId") int ingredientId);
	int checkFavoriteExists(@Param("memberId") String memberId, 
			   				@Param("ingredientId") int ingredientId);
	
	Ingredient selectById(int ingredientId);

}
