package com.proyectoarq.client;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import java.util.List;
import java.util.Arrays;
import java.util.Collections;

@Component
public class FlotaClient {

    @Autowired
    private RestTemplate restTemplate;

    @Value("${services.flota.url:https://192.168.1.17:8083}")
    private String flotaServiceUrl;

    public List<Long> getVehiculoIdsBySupervisor(Long supervisorId, String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", token);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            Long[] ids = restTemplate.exchange(
                flotaServiceUrl + "/api/vehiculos/supervisor/" + supervisorId,
                HttpMethod.GET,
                entity,
                Long[].class
            ).getBody();
            return ids != null ? Arrays.asList(ids) : Collections.emptyList();
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }
}
