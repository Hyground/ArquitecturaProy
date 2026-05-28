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
import com.proyectoarq.model.Vehiculo;
import com.proyectoarq.repository.VehiculoRepository;
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

@Service
public class ReporteService {

    @Autowired
    private ReporteRepository reporteRepository;

    @Autowired
    private VehiculoRepository vehiculoRepository;

    public void exportarVehiculosAPdf(HttpServletResponse response) throws IOException {
        List<Vehiculo> vehiculos = vehiculoRepository.findAll();
        Document document = new Document(PageSize.A4);
        PdfWriter.getInstance(document, response.getOutputStream());

        document.open();
        Font font = FontFactory.getFont(FontFactory.HELVETICA_BOLD);
        font.setSize(18);
        font.setColor(Color.BLUE);

        Paragraph p = new Paragraph("Reporte de Flota y Vehículos", font);
        p.setAlignment(Paragraph.ALIGN_CENTER);
        document.add(p);

        PdfPTable table = new PdfPTable(5);
        table.setWidthPercentage(100f);
        table.setSpacingBefore(15);

        writeHeaderPdf(table);
        writeTableDataPdf(table, vehiculos);

        document.add(table);
        document.close();
    }

    private void writeHeaderPdf(PdfPTable table) {
        PdfPCell cell = new PdfPCell();
        cell.setBackgroundColor(new Color(30, 58, 138));
        cell.setPadding(5);

        Font font = FontFactory.getFont(FontFactory.HELVETICA_BOLD);
        font.setColor(Color.WHITE);

        String[] headers = {"ID", "Placa", "Marca", "Modelo", "Estado"};
        for (String header : headers) {
            cell.setPhrase(new Phrase(header, font));
            table.addCell(cell);
        }
    }

    private void writeTableDataPdf(PdfPTable table, List<Vehiculo> vehiculos) {
        for (Vehiculo v : vehiculos) {
            table.addCell(String.valueOf(v.getId()));
            table.addCell(v.getPlaca());
            table.addCell(v.getMarca());
            table.addCell(v.getModelo());
            table.addCell(v.getEstado());
        }
    }

    public void exportarVehiculosAExcel(HttpServletResponse response) throws IOException {
        List<Vehiculo> vehiculos = vehiculoRepository.findAll();
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Vehiculos");

        org.apache.poi.ss.usermodel.Row headerRow = sheet.createRow(0);
        String[] columns = {"ID", "Placa", "Marca", "Modelo", "Estado", "Flota"};

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
        for (Vehiculo v : vehiculos) {
            org.apache.poi.ss.usermodel.Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(v.getId());
            row.createCell(1).setCellValue(v.getPlaca());
            row.createCell(2).setCellValue(v.getMarca());
            row.createCell(3).setCellValue(v.getModelo());
            row.createCell(4).setCellValue(v.getEstado());
            row.createCell(5).setCellValue(v.getFlota() != null ? v.getFlota().getNombre() : "N/A");
        }

        for (int i = 0; i < columns.length; i++) {
            sheet.autoSizeColumn(i);
        }

        workbook.write(response.getOutputStream());
        workbook.close();
    }
}
