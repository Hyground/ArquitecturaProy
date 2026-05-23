package com.proyectoarq.controller;

import com.proyectoarq.service.ReporteService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
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

    @GetMapping("/export/pdf")
    public void exportToPDF(HttpServletResponse response) throws IOException {
        response.setContentType("application/pdf");
        DateFormat dateFormatter = new SimpleDateFormat("yyyy-MM-dd_HH:mm:ss");
        String currentDateTime = dateFormatter.format(new Date());

        String headerKey = "Content-Disposition";
        String headerValue = "attachment; filename=boletas_" + currentDateTime + ".pdf";
        response.setHeader(headerKey, headerValue);

        reporteService.exportarBoletasAPdf(response);
    }

    @GetMapping("/export/excel")
    public void exportToExcel(HttpServletResponse response) throws IOException {
        response.setContentType("application/octet-stream");
        DateFormat dateFormatter = new SimpleDateFormat("yyyy-MM-dd_HH:mm:ss");
        String currentDateTime = dateFormatter.format(new Date());

        String headerKey = "Content-Disposition";
        String headerValue = "attachment; filename=boletas_" + currentDateTime + ".xlsx";
        response.setHeader(headerKey, headerValue);

        reporteService.exportarBoletasAExcel(response);
    }
}
