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
import com.proyectoarq.model.Boleta;
import com.proyectoarq.repository.BoletaRepository;
import com.proyectoarq.repository.ReporteRepository;
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
    private com.proyectoarq.client.FlotaClient flotaClient;

    @Autowired
    private com.proyectoarq.repository.ViajeRepository viajeRepository;

    public List<Boleta> obtenerTodasLasBoletas() {
        return boletaRepository.findAll();
    }

    public void exportarBoletasAPdf(HttpServletResponse response, Long userId, String role, String token) throws IOException {
        List<Boleta> boletas = filtrarBoletasPorUsuario(userId, role, token);
        Document document = new Document(PageSize.A4.rotate());
        PdfWriter.getInstance(document, response.getOutputStream());

        document.open();
        Font font = FontFactory.getFont(FontFactory.HELVETICA_BOLD);
        font.setSize(18);
        font.setColor(Color.BLUE);

        Paragraph p = new Paragraph("Reporte de Boletas Logísticas - " + role, font);
        p.setAlignment(Paragraph.ALIGN_CENTER);
        document.add(p);
        
        document.add(new Paragraph("Generado por Usuario ID: " + userId));

        PdfPTable table = new PdfPTable(9);
        table.setWidthPercentage(100f);
        table.setWidths(new float[]{1.0f, 2.5f, 3.0f, 2.0f, 1.5f, 1.5f, 2.0f, 2.5f, 2.5f});
        table.setSpacingBefore(15);

        writeHeaderPdf(table);
        writeTableDataPdf(table, boletas);

        document.add(table);
        document.close();
    }

    private List<Boleta> filtrarBoletasPorUsuario(Long userId, String role, String token) {
        if ("ROLE_ADMINISTRADOR".equals(role)) {
            return boletaRepository.findAll();
        } else if ("ROLE_SUPERVISOR".equals(role)) {
            List<Long> vehiculoIds = flotaClient.getVehiculoIdsBySupervisor(userId, token);
            return boletaRepository.findAll().stream()
                .filter(b -> {
                    return viajeRepository.findByBoletaId(b.getId())
                        .map(v -> vehiculoIds.contains(v.getVehiculoId()))
                        .orElse(false);
                })
                .collect(Collectors.toList());
        }
        return Collections.emptyList();
    }

    private void writeHeaderPdf(PdfPTable table) {
        PdfPCell cell = new PdfPCell();
        cell.setBackgroundColor(new Color(30, 58, 138));
        cell.setPadding(6);

        Font font = FontFactory.getFont(FontFactory.HELVETICA_BOLD);
        font.setColor(Color.WHITE);
        font.setSize(10);

        String[] headers = {"ID", "Código QR", "Fecha", "Carga", "Cant.", "Canast.", "Estado", "Origen", "Destino"};
        for (String header : headers) {
            cell.setPhrase(new Phrase(header, font));
            table.addCell(cell);
        }
    }

    private void writeTableDataPdf(PdfPTable table, List<Boleta> boletas) {
        Font font = FontFactory.getFont(FontFactory.HELVETICA);
        font.setSize(9);
        
        for (Boleta b : boletas) {
            table.addCell(new Phrase(String.valueOf(b.getId()), font));
            table.addCell(new Phrase(b.getCodigoQr(), font));
            table.addCell(new Phrase(b.getFecha().toString().substring(0, 16).replace("T", " "), font));
            table.addCell(new Phrase(b.getCarga(), font));
            table.addCell(new Phrase(String.valueOf(b.getCantidad()), font));
            table.addCell(new Phrase(String.valueOf(b.getCanastas() != null ? b.getCanastas() : 0), font));
            table.addCell(new Phrase(b.getEstado(), font));
            table.addCell(new Phrase(b.getOrigen(), font));
            table.addCell(new Phrase(b.getDestino(), font));
        }
    }

    public void exportarBoletasAExcel(HttpServletResponse response, Long userId, String role, String token) throws IOException {
        List<Boleta> boletas = filtrarBoletasPorUsuario(userId, role, token);
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Boletas");

        org.apache.poi.ss.usermodel.Row headerRow = sheet.createRow(0);
        String[] columns = {"ID", "Código QR", "Fecha", "Carga", "Cantidad", "Canastas", "Estado", "Origen", "Destino"};

        CellStyle headerStyle = workbook.createCellStyle();
        headerStyle.setFillForegroundColor(IndexedColors.BLUE_GREY.getIndex());
        headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        headerStyle.setBorderBottom(BorderStyle.THIN);
        
        org.apache.poi.ss.usermodel.Font font = workbook.createFont();
        font.setColor(IndexedColors.WHITE.getIndex());
        font.setBold(true);
        headerStyle.setFont(font);

        for (int i = 0; i < columns.length; i++) {
            org.apache.poi.ss.usermodel.Cell cell = headerRow.createCell(i);
            cell.setCellValue(columns[i]);
            cell.setCellStyle(headerStyle);
        }

        int rowNum = 1;
        for (Boleta b : boletas) {
            org.apache.poi.ss.usermodel.Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(b.getId());
            row.createCell(1).setCellValue(b.getCodigoQr());
            row.createCell(2).setCellValue(b.getFecha().toString().replace("T", " "));
            row.createCell(3).setCellValue(b.getCarga());
            row.createCell(4).setCellValue(b.getCantidad());
            row.createCell(5).setCellValue(b.getCanastas() != null ? b.getCanastas() : 0);
            row.createCell(6).setCellValue(b.getEstado());
            row.createCell(7).setCellValue(b.getOrigen());
            row.createCell(8).setCellValue(b.getDestino());
        }

        for (int i = 0; i < columns.length; i++) {
            sheet.autoSizeColumn(i);
        }

        workbook.write(response.getOutputStream());
        workbook.close();
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
