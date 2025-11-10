package com.fom.boot.domain.ingredient.model.vo;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class FavoriteIngredient {
	private int favoriteId; 		// FAVORITE_ID(찜 ID)
	private String memberId; 		// MEMBER_ID(회원 아이디)
	private int ingredientId; 		// INGREDIENT_ID(식자재 ID)
	private String isCustom; 		// IS_CUSTOM(커스텀 식자재 여부)
}
