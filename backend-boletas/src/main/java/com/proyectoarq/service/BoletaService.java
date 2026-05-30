package com.proyectoarq.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.proyectoarq.model.Boleta;
import com.proyectoarq.repository.BoletaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.UUID;

@Service
public class BoletaService {

    @Autowired
    private BoletaRepository boletaRepository;

    public Boleta crearBoleta(Boleta boleta) {
        if (boleta.getFecha() == null) boleta.setFecha(LocalDateTime.now());
        if (boleta.getCodigoQr() == null || boleta.getCodigoQr().isEmpty()) {
            boleta.setCodigoQr(UUID.randomUUID().toString());
        }
        if (boleta.getEstado() == null) boleta.setEstado("PENDIENTE");
        return boletaRepository.save(boleta);
    }

    public List<Boleta> listarBoletas() {
        return boletaRepository.findAll();
    }

    public List<Boleta> listarPorConductor(String nombre) {
        return boletaRepository.findByConductorNombre(nombre);
    }

    public Boleta obtenerBoleta(Long id) {
        return boletaRepository.findById(id).orElse(null);
    }

    public Boleta obtenerBoletaPorQr(String qr) {
        return boletaRepository.findByCodigoQr(qr).orElse(null);
    }

    public void eliminarBoleta(Long id) {
        boletaRepository.deleteById(id);
    }

    public byte[] generarQRCode(String texto) throws Exception {
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(texto, BarcodeFormat.QR_CODE, 250, 250);

        ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutputStream);
        return pngOutputStream.toByteArray();
    }

    public String generarQRCodeBase64(String texto) throws Exception {
        byte[] imageBytes = generarQRCode(texto);
        return Base64.getEncoder().encodeToString(imageBytes);
    }
}
