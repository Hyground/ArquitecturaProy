package com.proyectoarq.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public Boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(token);
            return !extractExpiration(token).before(new Date());
        } catch (Exception e) {
            return false;
        }
    }

    public Long extractUserId(String token) {
        Claims claims = extractAllClaims(token);
        // userId can be an Integer or Long depending on how Jackson/JJWT parses it
        Object userId = claims.get("userId");
        if (userId instanceof Integer) {
            return ((Integer) userId).longValue();
        }
        return claims.get("userId", Long.class);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    @SuppressWarnings("unchecked")
    public Authentication getAuthentication(String token) {
        Claims claims = extractAllClaims(token);
        String username = claims.getSubject();
        
        List<Map<String, String>> rolesList = (List<Map<String, String>>) claims.get("roles");
        Collection<? extends GrantedAuthority> authorities = rolesList.stream()
                .map(roleMap -> new SimpleGrantedAuthority(roleMap.get("authority")))
                .collect(Collectors.toList());

        return new UsernamePasswordAuthenticationToken(username, null, authorities);
    }
}
