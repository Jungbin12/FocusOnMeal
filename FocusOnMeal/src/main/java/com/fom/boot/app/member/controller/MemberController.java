package com.fom.boot.app.member.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fom.boot.app.jwt.JwtTokenProvider;
import com.fom.boot.app.member.dto.LoginRequest;
import com.fom.boot.app.member.dto.LoginResponse;
import com.fom.boot.domain.member.model.service.MemberService;
import com.fom.boot.domain.member.model.vo.Member;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@CrossOrigin(origins = "http://localhost:5173")
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("member")
public class MemberController {

	private final BCryptPasswordEncoder bcrypt;
	private final MemberService mService;
	private final JwtTokenProvider jwtTokenProvider;

	@PostMapping("login")
	public ResponseEntity<?> checkLogin(@RequestBody LoginRequest loginRequest) {
		// 로그인 시도 로그
		log.info("[로그인 시도] ID: {}", loginRequest.getMemberId());
				
		try {
			Member loginMember = mService.selectOneByLogin(loginRequest);

			// 회원 정보 검증
			if(loginMember == null || "N".equals(loginMember.getStatusYn())) {
				log.warn("[로그인 실패] 존재하지 않는 회원: {}", loginRequest.getMemberId());
				return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
					.body("회원정보가 없습니다.");
			}

			// 비밀번호 검증
			if(!bcrypt.matches(loginRequest.getMemberPw(), loginMember.getMemberPw())) {
				log.warn("[로그인 실패] 비밀번호 불일치: {}", loginRequest.getMemberId());
				return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
					.body("비밀번호가 일치하지 않습니다.");
			}

			// JWT 토큰 생성
			String token = jwtTokenProvider.createToken(loginMember.getMemberId());

			// 로그인 응답 생성
			LoginResponse response = new LoginResponse(
				token,
				loginMember.getMemberId(),
				loginMember.getMemberName(),
				loginMember.getAdminYn(),
				loginMember.getMemberNickname()
			);
			log.info("[로그인 성공] ID: {}", loginMember.getMemberId());
			return ResponseEntity.ok(response);

		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body("서버 오류가 발생했습니다: " + e.getMessage());
		}
	}
	
	
	@PostMapping("logout")
	public ResponseEntity<?> logout(@RequestHeader("Authorization") String authHeader) {
		if(authHeader == null || !authHeader.startsWith("Bearer")) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("토큰없음");
		}
		
		String token = authHeader.substring(7);
		// 실제 운영 환경에서는 이 토큰을 Redis 같은 곳에 "블랙리스트"로 등록
	    // 예: redisService.saveBlackList(token, jwtUtil.getExpiration(token));
		log.info("[로그아웃] 토큰: {}", token.substring(0, 10) + "..."); // 토큰 일부만 로깅
		return ResponseEntity.ok("로그아웃 완료");
	}
	
	
	@PostMapping("forms")
	public String sigupFormPage() {
		return "member/join";
	}
	
	@PostMapping("terms")
	public String showterms() {
		return "member/terms";
	}
	
	@PostMapping("privacy")
	public String showprivacy() {
		return "member/privacy";
	}
	
	@PostMapping("join")
	public ResponseEntity<?> joinMember(@RequestBody Member member) {
		// 회원가입 요청 로그 추가
		log.info("[회원가입 시도] ID: {}, Name: {}", member.getMemberId(), member.getMemberName());
		
	    try {
	        member.setMemberPw(bcrypt.encode(member.getMemberPw()));
	        int result = mService.insertMember(member);
	        if(result > 0) {
	        	log.info("[회원가입 성공] ID: {}", member.getMemberId());
	            return ResponseEntity.ok("회원가입 성공");
	        } else {
	        	log.warn("[회원가입 실패] DB 입력 실패 - ID: {}", member.getMemberId());
	            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
	                .body("회원가입 실패");
	        }
	    } catch (Exception e) {
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	            .body("서버 오류: " + e.getMessage());
	    }
	}
	

}
