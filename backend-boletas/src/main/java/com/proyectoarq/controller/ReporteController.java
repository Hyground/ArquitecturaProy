package com.proyectoarq.controller;

import com.proyectoarq.service.ReporteService;
import com.proyectoarq.model.Reporte;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;

@RestController
@RequestMapping("/api/reportes")
@PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERVISOR')")
public class ReporteController {

    @Autowired
    private ReporteService reporteService;

    @Autowired
    private com.proyectoarq.security.JwtUtil jwtUtil;

    @GetMapping("/export/pdf")
    public void exportToPDF(HttpServletResponse response, @RequestHeader("Authorization") String token, Authentication auth) throws IOException {
        response.setContentType("application/pdf");
        DateFormat dateFormatter = new SimpleDateFormat("yyyy-MM-dd_HH:mm:ss");
        String currentDateTime = dateFormatter.format(new Date());

        String headerKey = "Content-Disposition";
        String headerValue = "attachment; filename=boletas_" + currentDateTime + ".pdf";
        response.setHeader(headerKey, headerValue);

        Long userId = jwtUtil.extractUserId(token.replace("Bearer ", ""));
        String role = auth.getAuthorities().iterator().next().getAuthority();

        reporteService.exportarBoletasAPdf(response, userId, role, token);
    }

    @GetMapping("/export/excel")
    public void exportToExcel(HttpServletResponse response, @RequestHeader("Authorization") String token, Authentication auth) throws IOException {
        response.setContentType("application/octet-stream");
        DateFormat dateFormatter = new SimpleDateFormat("yyyy-MM-dd_HH:mm:ss");
        String currentDateTime = dateFormatter.format(new Date());

        String headerKey = "Content-Disposition";
        String headerValue = "attachment; filename=boletas_" + currentDateTime + ".xlsx";
        response.setHeader(headerKey, headerValue);

        Long userId = jwtUtil.extractUserId(token.replace("Bearer ", ""));
        String role = auth.getAuthorities().iterator().next().getAuthority();

        reporteService.exportarBoletasAExcel(response, userId, role, token);
    }

    @PostMapping("/consolidar")
    public ResponseEntity<Reporte> consolidarReporte() {
        return ResponseEntity.ok(reporteService.consolidarReporte());
    }
}
