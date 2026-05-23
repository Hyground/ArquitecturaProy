import java.sql.*;

public class DbCheck {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://localhost:5432/proyectoarq_db";
        String user = "postgres";
        String password = "admin";

        try (Connection conn = DriverManager.getConnection(url, user, password)) {
            System.out.println("Conectado a PostgreSQL");
            try (Statement stmt = conn.createStatement()) {
                ResultSet rs = stmt.executeQuery("SELECT correo, rol FROM usuarios");
                while (rs.next()) {
                    System.out.println("Usuario: " + rs.getString("correo") + " | Rol: " + rs.getString("rol"));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
