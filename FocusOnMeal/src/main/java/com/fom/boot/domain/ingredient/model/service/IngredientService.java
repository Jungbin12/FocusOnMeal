package com.fom.boot.domain.ingredient.model.service;

import com.fom.boot.domain.ingredient.model.vo.FavoriteIngredient;

public interface IngredientService {

	// 찜 등록 및 해제
	int insertFavorite(FavoriteIngredient favorite);
	int deleteFavorite(String memberId, int ingredientId);
	boolean checkFavoriteExists(String memberId, int ingredientId);

}
