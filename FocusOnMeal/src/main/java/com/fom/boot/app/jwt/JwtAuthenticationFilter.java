package com.fom.boot.app.jwt;

import java.io.IOException;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter { 
											// OncePerRequestFilter : 스프링이 제공하는 필터 추상 클래스 하나의 요청당 딱 한번만 실행되도록 

    private final JwtTokenProvider jwtTokenProvider;

    @Override
    protected void doFilterInternal(HttpServletRequest request, // 클라이언트가 보낸 HTTP 요청 정보(헤더, 파라미터, 쿠키 URL 등)
    								HttpServletResponse response, // 서버가 클라이언트에게 보낼 HTTP 응답(상태코드, 헤더, 바디 등)
    								FilterChain filterChain /* 다음 필터로 요청을 전달. 38줄을 호출해야 다음필터 실행, 이걸 호출하지 않으면 요청이 컨트롤러까지 가지 않음 */) 
    										throws ServletException, IOException {
        
        String token = resolveToken(request); // 1. Request 헤더에서 토큰 추출

        // 2. validateToken으로 토큰 유효성 검사
        if (token != null && jwtTokenProvider.validateToken(token)) {
            // 3. 토큰이 유효하면 토큰으로부터 인증 정보를 받아옴
            Authentication authentication = jwtTokenProvider.getAuthentication(token);
            // 4. SecurityContext에 Authentication 객체를 저장
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }
        
        filterChain.doFilter(request, response); // 5. 다음 필터로 전달
    }

    // Request Header에서 "Bearer " 토큰 정보 추출
    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
