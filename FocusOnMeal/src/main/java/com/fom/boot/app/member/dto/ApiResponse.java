package com.fom.boot.app.member.dto;

import lombok.Getter;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;

    public static <T> ApiResponse<T> success(String msg, T data) {
        return new ApiResponse<>(true, msg, data);
    }

    public static <T> ApiResponse<T> success(String msg) {
        return new ApiResponse<>(true, msg, null);
    }

    public static <T> ApiResponse<T> error(String msg, T data) {
        return new ApiResponse<>(false, msg, data);
    }

    public static <T> ApiResponse<T> error(String msg) {
        return new ApiResponse<>(false, msg, null);
    }
}
