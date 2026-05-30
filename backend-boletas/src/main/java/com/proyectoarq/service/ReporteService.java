package com.proyectoarq.service;

import com.lowagie.text.Document;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.proyectoarq.dto.FlotaDTO;
import com.proyectoarq.dto.VehiculoDTO;
import com.proyectoarq.model.Boleta;
import com.proyectoarq.model.Reporte;
import com.proyectoarq.repository.BoletaRepository;
import com.proyectoarq.repository.ReporteRepository;
import com.proyectoarq.client.FlotaClient;
import com.proyectoarq.client.UserSyncClient;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Collections;

@Service
public class ReporteService {

    @Autowired
    private ReporteRepository reporteRepository;

    @Autowired
    private BoletaRepository boletaRepository;

    @Autowired
    private FlotaClient flotaClient;

    @Autowired
    private UserSyncClient userSyncClient;

    @Autowired
    private com.proyectoarq.repository.ViajeRepository viajeRepository;

    public List<Boleta> obtenerTodasLasBoletas() {
        return boletaRepository.findAll();
    }

    public List<Reporte> obtenerTodosLosReportes() {
        return reporteRepository.findAll();
    }

    public void exportarBoletasAPdf(HttpServletResponse response, Long userId, String role, String token) throws IOException {
        List<Boleta> boletas = filtrarBoletasPorUsuario(userId, role, token);
        String supervisorNombre = userSyncClient.getUserName(userId, token);
        List<FlotaDTO> flotas = flotaClient.getFlotasBySupervisor(userId, token);

        Document document = new Document(PageSize.A4.rotate());
        PdfWriter.getInstance(document, response.getOutputStream());

        document.open();
        
        // Header
        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, new Color(30, 58, 138));
        Paragraph title = new Paragraph("REPORTE LOGÍSTICO CONSOLIDADO", titleFont);
        title.setAlignment(Paragraph.ALIGN_CENTER);
        document.add(title);
        
        document.add(new Paragraph(" "));
        Font infoFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.DARK_GRAY);
        document.add(new Paragraph("Supervisor Responsable: " + supervisorNombre, infoFont));
        document.add(new Paragraph("Fecha de Emisión: " + LocalDateTime.now().toString().replace("T", " ").substring(0, 19), infoFont));
        document.add(new Paragraph("Total de Registros: " + boletas.size(), infoFont));
        document.add(new Paragraph("----------------------------------------------------------------------------------------------------------------------------------"));
        document.add(new Paragraph(" "));

        // Section: Flotas y su desempeño
        Font sectionFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, new Color(30, 58, 138));
        for (FlotaDTO flota : flotas) {
            document.add(new Paragraph("FLOTA: " + flota.getNombre().toUpperCase(), sectionFont));
            document.add(new Paragraph(" "));

            if (flota.getVehiculos() != null && !flota.getVehiculos().isEmpty()) {
                for (VehiculoDTO vehiculo : flota.getVehiculos()) {
                    document.add(new Paragraph("   > VEHÍCULO: " + vehiculo.getPlaca() + " (" + vehiculo.getMarca() + " " + vehiculo.getModelo() + ")", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11)));
                    
                    List<Boleta> boletasVehiculo = boletas.stream()
                        .filter(b -> b.getVehiculoPlaca() != null && b.getVehiculoPlaca().equals(vehiculo.getPlaca()))
                        .collect(Collectors.toList());

                    if (boletasVehiculo.isEmpty()) {
                        document.add(new Paragraph("      - Sin boletas registradas para este periodo.", FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 9)));
                    } else {
                        PdfPTable table = new PdfPTable(7);
                        table.setWidthPercentage(95f);
                        table.setSpacingBefore(10);
                        table.setSpacingAfter(10);
                        table.setHorizontalAlignment(PdfPTable.ALIGN_RIGHT);
                        
                        // Header de la tabla interna
                        String[] headers = {"ID", "Carga", "Cant (Tn)", "Canastas", "Origen", "Destino", "Estado"};
                        for (String h : headers) {
                            PdfPCell cell = new PdfPCell(new Phrase(h, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.WHITE)));
                            cell.setBackgroundColor(new Color(71, 85, 105));
                            cell.setPadding(5);
                            table.addCell(cell);
                        }

                        for (Boleta b : boletasVehiculo) {
                            table.addCell(new Phrase(String.valueOf(b.getId()), FontFactory.getFont(FontFactory.HELVETICA, 8)));
                            table.addCell(new Phrase(b.getCarga(), FontFactory.getFont(FontFactory.HELVETICA, 8)));
                            table.addCell(new Phrase(String.valueOf(b.getCantidad()), FontFactory.getFont(FontFactory.HELVETICA, 8)));
                            table.addCell(new Phrase(String.valueOf(b.getCanastas()), FontFactory.getFont(FontFactory.HELVETICA, 8)));
                            table.addCell(new Phrase(b.getOrigen(), FontFactory.getFont(FontFactory.HELVETICA, 8)));
                            table.addCell(new Phrase(b.getDestino(), FontFactory.getFont(FontFactory.HELVETICA, 8)));
                            table.addCell(new Phrase(b.getEstado(), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, b.getEstado().equals("ENTREGADO") ? Color.GREEN.darker() : Color.ORANGE.darker())));
                        }
                        document.add(table);
                    }
                    document.add(new Paragraph(" "));
                }
            } else {
                document.add(new Paragraph("   (No hay vehículos asignados a esta flota)", FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 10)));
            }
            document.add(new Paragraph("----------------------------------------------------------------------------------------------------------------------------------"));
        }

        document.close();
        guardarMetadatosReporte("PDF_HIERARCHICAL", userId, boletas.size());
    }

    private void guardarMetadatosReporte(String tipo, Long userId, int totalBoletas) {
        Reporte reporte = Reporte.builder()
                .fecha(LocalDateTime.now())
                .tipo(tipo)
                .datosGenerados("Generado por ID: " + userId + ". Total Boletas: " + totalBoletas)
                .build();
        reporteRepository.save(reporte);
    }

    private List<Boleta> filtrarBoletasPorUsuario(Long userId, String role, String token) {
        if ("ROLE_ADMINISTRADOR".equals(role)) {
            return boletaRepository.findAll();
        } else if ("ROLE_SUPERVISOR".equals(role)) {
            String supervisorNombre = userSyncClient.getUserName(userId, token);
            return boletaRepository.findAll().stream()
                .filter(b -> (b.getSupervisorNombre() != null && b.getSupervisorNombre().equalsIgnoreCase(supervisorNombre)) 
                          || "PENDIENTE".equals(b.getEstado()))
                .collect(Collectors.toList());
        }
        return Collections.emptyList();
    }

    public void exportarBoletasAExcel(HttpServletResponse response, Long userId, String role, String token) throws IOException {
        List<Boleta> boletas = filtrarBoletasPorUsuario(userId, role, token);
        String supervisorNombre = userSyncClient.getUserName(userId, token);
        List<FlotaDTO> flotas = flotaClient.getFlotasBySupervisor(userId, token);

        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Consolidado Logístico");

        CellStyle titleStyle = workbook.createCellStyle();
        org.apache.poi.ss.usermodel.Font titleFont = workbook.createFont();
        titleFont.setBold(true);
        titleFont.setFontHeightInPoints((short) 16);
        titleStyle.setFont(titleFont);

        CellStyle headerStyle = workbook.createCellStyle();
        headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        headerStyle.setBorderBottom(BorderStyle.MEDIUM);
        org.apache.poi.ss.usermodel.Font headFont = workbook.createFont();
        headFont.setBold(true);
        headerStyle.setFont(headFont);

        int rowIdx = 0;
        org.apache.poi.ss.usermodel.Row titleRow = sheet.createRow(rowIdx++);
        titleRow.createCell(0).setCellValue("REPORTE DE CIERRE OPERATIVO");
        titleRow.getCell(0).setCellStyle(titleStyle);

        org.apache.poi.ss.usermodel.Row supRow = sheet.createRow(rowIdx++);
        supRow.createCell(0).setCellValue("Supervisor:");
        supRow.createCell(1).setCellValue(supervisorNombre);

        rowIdx++; // Space

        for (FlotaDTO flota : flotas) {
            org.apache.poi.ss.usermodel.Row fRow = sheet.createRow(rowIdx++);
            fRow.createCell(0).setCellValue("FLOTA: " + flota.getNombre());
            
            if (flota.getVehiculos() != null) {
                for (VehiculoDTO v : flota.getVehiculos()) {
                    org.apache.poi.ss.usermodel.Row vRow = sheet.createRow(rowIdx++);
                    vRow.createCell(1).setCellValue("VEHÍCULO: " + v.getPlaca() + " (" + v.getMarca() + ")");

                    // Table Headers
                    org.apache.poi.ss.usermodel.Row hRow = sheet.createRow(rowIdx++);
                    String[] headers = {"ID", "Carga", "Toneladas", "Canastas", "Origen", "Destino", "Estado", "Chofer"};
                    for (int i = 0; i < headers.length; i++) {
                        org.apache.poi.ss.usermodel.Cell cell = hRow.createCell(i + 2);
                        cell.setCellValue(headers[i]);
                        cell.setCellStyle(headerStyle);
                    }

                    List<Boleta> boletasVehiculo = boletas.stream()
                        .filter(b -> b.getVehiculoPlaca() != null && b.getVehiculoPlaca().equals(v.getPlaca()))
                        .collect(Collectors.toList());

                    for (Boleta b : boletasVehiculo) {
                        org.apache.poi.ss.usermodel.Row dataRow = sheet.createRow(rowIdx++);
                        dataRow.createCell(2).setCellValue(b.getId());
                        dataRow.createCell(3).setCellValue(b.getCarga());
                        dataRow.createCell(4).setCellValue(b.getCantidad());
                        dataRow.createCell(5).setCellValue(b.getCanastas() != null ? b.getCanastas() : 0);
                        dataRow.createCell(6).setCellValue(b.getOrigen());
                        dataRow.createCell(7).setCellValue(b.getDestino());
                        dataRow.createCell(8).setCellValue(b.getEstado());
                        dataRow.createCell(9).setCellValue(b.getConductorNombre());
                    }
                    rowIdx++; // Space between vehicles
                }
            }
            rowIdx++; // Space between fleets
        }

        for (int i = 0; i < 10; i++) sheet.autoSizeColumn(i);

        workbook.write(response.getOutputStream());
        workbook.close();
        guardarMetadatosReporte("EXCEL_HIERARCHICAL", userId, boletas.size());
    }

    public com.proyectoarq.model.Reporte consolidarReporte() {
        List<Boleta> boletas = boletaRepository.findAll();
        long entregadas = boletas.stream().filter(b -> "ENTREGADO".equals(b.getEstado())).count();
        
        com.proyectoarq.model.Reporte reporte = com.proyectoarq.model.Reporte.builder()
            .fecha(java.time.LocalDateTime.now())
            .tipo("CIERRE_PERIODO")
            .datosGenerados("Total: " + boletas.size() + ", Entregadas: " + entregadas)
            .build();
            
        return reporteRepository.save(reporte);
    }
}
