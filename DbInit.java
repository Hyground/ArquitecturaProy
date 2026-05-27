import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class DbInit {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://localhost:5432/";
        String user = "postgres";
        String password = "Oreo_2005";

        String[] dbs = {"backend_user_db", "backend_boletas_db", "backend_flota_db"};

        try (Connection conn = DriverManager.getConnection(url, user, password);
             Statement stmt = conn.createStatement()) {
            
            for (String db : dbs) {
                try {
                    stmt.executeUpdate("CREATE DATABASE " + db);
                    System.out.println("Base de datos creada: " + db);
                } catch (Exception e) {
                    System.out.println("La base de datos " + db + " ya existe o no se pudo crear.");
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
