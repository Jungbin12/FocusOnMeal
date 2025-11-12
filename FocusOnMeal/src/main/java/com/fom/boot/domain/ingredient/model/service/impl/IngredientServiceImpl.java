package com.fom.boot.domain.ingredient.model.service.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fom.boot.domain.ingredient.model.mapper.IngredientMapper;
import com.fom.boot.domain.ingredient.model.service.IngredientService;
import com.fom.boot.domain.ingredient.model.vo.FavoriteIngredient;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class IngredientServiceImpl implements IngredientService {
	
	private final IngredientMapper iMapper;

	// 찜 등록 및 해제
	@Override
    @Transactional
    public int insertFavorite(FavoriteIngredient favorite) {
        return iMapper.insertFavorite(favorite);
    }
    @Override
    @Transactional
    public int deleteFavorite(String memberId, int ingredientId) {
        return iMapper.deleteFavorite(memberId, ingredientId);
    }
    @Override
    public boolean checkFavoriteExists(String memberId, int ingredientId) {
        int count = iMapper.checkFavoriteExists(memberId, ingredientId);
        return count > 0;
    }

}
