package com.proyectoarq.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Component
public class UserSyncClient {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${services.user-core.url:http://localhost:8081}")
    private String userCoreUrl;

    public void syncUserData(Long userId, Map<String, Object> data, String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", token);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(data, headers);

        restTemplate.exchange(
            userCoreUrl + "/api/sync/user-data/" + userId,
            HttpMethod.POST,
            entity,
            Void.class
        );
    }
}
