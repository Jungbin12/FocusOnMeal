package com.fom.boot.app.member.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.fom.boot.app.jwt.JwtTokenProvider;
import com.fom.boot.app.member.dto.*;
import com.fom.boot.domain.member.model.service.MemberService;
import com.fom.boot.domain.member.model.service.EmailService;
import com.fom.boot.domain.member.model.service.PasswordResetService;
import com.fom.boot.domain.member.model.vo.Member;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

/**
 * 회원 관련 통합 컨트롤러 (React용)
 * 
 * @author FocusOnMale Team
 * @since 2025-11-17
 */
@Slf4j
@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequiredArgsConstructor
@RequestMapping("/member")
public class MemberController {

    private final BCryptPasswordEncoder bcrypt;
    private final MemberService mService;
    private final JwtTokenProvider jwtTokenProvider;
    private final EmailService emailService;
    private final PasswordResetService passwordResetService;

    // ========== 로그인/로그아웃 ==========

    @PostMapping("/login")
    public ResponseEntity<?> checkLogin(@RequestBody LoginRequest loginRequest) {
    	 // 로그인 시도 로그
        log.info("[로그인 시도] ID: {}", loginRequest.getMemberId());
        try {
            Member loginMember = mService.selectOneByLogin(loginRequest);

            // 회원 정보 검증
            if(loginMember == null || "N".equals(loginMember.getStatusYn())) {
            	log.warn("[로그인 실패] 존재하지 않는 회원: {}", loginRequest.getMemberId());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("회원정보가 없습니다."));
            }

            // 비밀번호 검증
            if(!bcrypt.matches(loginRequest.getMemberPw(), loginMember.getMemberPw())) {
            	log.warn("[로그인 실패] 비밀번호 불일치: {}", loginRequest.getMemberId());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("비밀번호가 일치하지 않습니다."));
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

            return ResponseEntity.ok(ApiResponse.success("로그인 성공", response));

        } catch (Exception e) {
            log.error("로그인 오류: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("서버 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String authHeader) {
        if(authHeader == null || !authHeader.startsWith("Bearer")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("토큰이 없습니다."));
        }
        
        String token = authHeader.substring(7);
        // 실제 운영: Redis 블랙리스트 등록
        
        return ResponseEntity.ok(ApiResponse.success("로그아웃 완료"));
    }

    // ========== 회원가입 ==========

    /**
     * 아이디 중복 확인
     */
    @GetMapping("/check-id/{memberId}")
    public ResponseEntity<?> checkMemberId(@PathVariable String memberId) {
        try {
            Member existMember = mService.selectOneById(memberId);
            boolean exists = (existMember != null);
            
            if (exists) {
                return ResponseEntity.ok(
                    ApiResponse.error("이미 사용중인 아이디입니다.", 
                    new IdCheckResponse(false))
                );
            } else {
                return ResponseEntity.ok(
                    ApiResponse.success("사용 가능한 아이디입니다.", 
                    new IdCheckResponse(true))
                );
            }
        } catch (Exception e) {
            log.error("아이디 중복 확인 오류: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("서버 오류가 발생했습니다."));
        }
    }

    /**
     * 이메일 인증 코드 발송
     */
    @PostMapping("/send-verification-code")
    public ResponseEntity<?> sendVerificationCode(@RequestBody EmailVerificationRequest request) {
        try {
            // 이메일 중복 확인
            boolean exists = mService.checkEmailExists(request.getEmail());
            if (exists) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("이미 사용중인 이메일입니다."));
            }
            
            // 6자리 인증 코드 생성
            String verificationCode = emailService.generateVerificationCode();
            
            // 이메일 발송
            emailService.sendVerificationEmail(request.getEmail(), verificationCode);
            
            // 인증 코드 저장 (5분 유효)
            mService.saveVerificationCode(request.getEmail(), verificationCode);
            
            return ResponseEntity.ok(
                ApiResponse.success("인증 코드가 이메일로 발송되었습니다.")
            );
        } catch (Exception e) {
            log.error("이메일 인증 코드 발송 오류: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("이메일 발송에 실패했습니다."));
        }
    }

    /**
     * 이메일 인증 코드 확인
     */
    @PostMapping("/verify-email-code")
    public ResponseEntity<?> verifyEmailCode(@RequestBody EmailCodeVerificationRequest request) {
        try {
            boolean isValid = mService.verifyEmailCode(request.getEmail(), request.getCode());
            
            if (isValid) {
                return ResponseEntity.ok(
                    ApiResponse.success("이메일 인증이 완료되었습니다.", 
                    new EmailVerificationResponse(true))
                );
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("인증 코드가 일치하지 않거나 만료되었습니다.", 
                    new EmailVerificationResponse(false))
                );
            }
        } catch (Exception e) {
            log.error("이메일 인증 확인 오류: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("서버 오류가 발생했습니다."));
        }
    }

    /**
     * 회원가입
     */
    
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
    
    @PostMapping("/join")
    public ResponseEntity<?> joinMember(@Valid @RequestBody JoinRequest request) {
        try {
            // 1. 아이디 중복 확인
            Member existMember = mService.selectOneById(request.getMemberId());
            if (existMember != null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("이미 사용중인 아이디입니다."));
            }
            
            // 2. 이메일 중복 확인
            if (mService.checkEmailExists(request.getEmail())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("이미 사용중인 이메일입니다."));
            }
            
            // 3. 이메일 인증 여부 확인
            if (!mService.isEmailVerified(request.getEmail())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("이메일 인증이 필요합니다."));
            }
            
            // 4. 비밀번호 유효성 검증
            if (!isValidPassword(request.getMemberPw())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("비밀번호는 8자 이상이며, 영문, 숫자, 특수문자를 포함해야 합니다."));
            }
            
            // 5. Member 객체 생성
            Member member = new Member();
            member.setMemberId(request.getMemberId());
            member.setMemberPw(bcrypt.encode(request.getMemberPw()));
            member.setMemberName(request.getMemberName());
            member.setMemberNickname(request.getMemberNickname());
            member.setEmail(request.getEmail());
            member.setPhone(request.getPhone());
            member.setGender(request.getGender());
            
            // 6. 회원가입 처리
            int result = mService.insertMember(member);
            
            if (result > 0) {
                // 인증 완료된 이메일 정보 삭제
                mService.deleteVerificationCode(request.getEmail());
                
                return ResponseEntity.ok(
                    ApiResponse.success("회원가입이 완료되었습니다.")
                );
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("회원가입에 실패했습니다."));
            }
        } catch (Exception e) {
            log.error("회원가입 오류: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("서버 오류: " + e.getMessage()));
        }
    }

    // ========== 비밀번호 찾기 ==========

    /**
     * 비밀번호 재설정 링크 발송
     */
    @PostMapping("/password/reset-request")
    public ResponseEntity<?> sendPasswordResetLink(
            @Valid @RequestBody PasswordResetLinkRequest request,
            HttpServletRequest httpRequest) {
        
        try {
            String ipAddress = getClientIpAddress(httpRequest);
            String userAgent = httpRequest.getHeader("User-Agent");
            
            boolean success = passwordResetService.sendPasswordResetLink(
                request.getMemberId(),
                request.getEmail(),
                ipAddress,
                userAgent
            );
            
            if (success) {
                return ResponseEntity.ok(
                    ApiResponse.success(
                        "비밀번호 재설정 링크가 이메일로 발송되었습니다.",
                        new EmailSentResponse(request.getEmail())
                    )
                );
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("처리 중 오류가 발생했습니다."));
            }
        } catch (Exception e) {
            log.error("비밀번호 재설정 요청 실패: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * 토큰 유효성 검증
     */
    @GetMapping("/password/validate-token")
    public ResponseEntity<?> validateToken(@RequestParam("token") String token) {
        try {
            boolean isValid = passwordResetService.validateToken(token);
            
            if (isValid) {
                return ResponseEntity.ok(
                    ApiResponse.success("유효한 토큰입니다.", 
                    new TokenValidationResponse(true))
                );
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("유효하지 않거나 만료된 링크입니다.", 
                    new TokenValidationResponse(false))
                );
            }
        } catch (Exception e) {
            log.error("토큰 검증 실패: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("토큰 검증 중 오류가 발생했습니다."));
        }
    }

    /**
     * 비밀번호 재설정
     */
    @PostMapping("/password/reset")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody PasswordResetRequest request) {
        try {
            if (!request.getNewPassword().equals(request.getConfirmPassword())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("비밀번호가 일치하지 않습니다."));
            }
            
            if (!isValidPassword(request.getNewPassword())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("비밀번호는 8자 이상이며, 영문, 숫자, 특수문자를 포함해야 합니다."));
            }
            
            boolean success = passwordResetService.resetPassword(
                request.getToken(), 
                request.getNewPassword()
            );
            
            if (success) {
                return ResponseEntity.ok(
                    ApiResponse.success("비밀번호가 성공적으로 변경되었습니다.")
                );
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("비밀번호 변경에 실패했습니다."));
            }
        } catch (Exception e) {
            log.error("비밀번호 재설정 실패: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ========== 아이디 찾기 ==========

    /**
     * 아이디 찾기
     */
    @PostMapping("/id/search")
    public ResponseEntity<?> searchMemberId(@Valid @RequestBody IdSearchRequest request) {
        try {
            boolean success = passwordResetService.sendMemberIdByEmail(
                request.getMemberName(),
                request.getEmail()
            );
            
            if (success) {
                return ResponseEntity.ok(
                    ApiResponse.success(
                        "아이디 찾기 결과가 이메일로 발송되었습니다.",
                        new EmailSentResponse(request.getEmail())
                    )
                );
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("처리 중 오류가 발생했습니다."));
            }
        } catch (Exception e) {
            log.error("아이디 찾기 실패: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ========== 유틸리티 메서드 ==========

    private String getClientIpAddress(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }

    private boolean isValidPassword(String password) {
        if (password == null || password.length() < 8) {
            return false;
        }
        boolean hasLetter = password.matches(".*[A-Za-z].*");
        boolean hasDigit = password.matches(".*\\d.*");
        boolean hasSpecial = password.matches(".*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?].*");
        return hasLetter && hasDigit && hasSpecial;
    }

   

   
}
