



const resp = await fetch("https://api.openai.com/v1/chat/completions", {
  method: "POST", headers: { "Content-Type": "application/json", "Authorization": "Bearer TU_API_KEY" },
  body: JSON.stringify({ model: "gpt-4", messages: [{role:"user", content: pregunta}] })
});
const data = await resp.json();
mostrarRespuesta(data.choices[0].message.content);



/*

import java.util.Scanner;

public class RecuperacionCuenta {

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        // Paso 1: Verificación identidad
        System.out.println("Ingrese su correo registrado:");
        String correo = sc.nextLine();

        if(verificarCorreo(correo)) {
            System.out.println("Por favor, acepte los términos legales (si/no):");
            String consentimiento = sc.nextLine();

            if(consentimiento.equalsIgnoreCase("si")) {
                String codigo = enviarCodigo(correo);
                System.out.println("Ingrese el código que recibió:");
                String codigoInput = sc.nextLine();

                if(codigo.equals(codigoInput)) {
                    System.out.println("Código correcto. Puede cambiar su contraseña.");
                    // Aquí se pediría la nueva contraseña y se guardaría

                    System.out.println("¿Desea activar la autenticación en dos pasos? (si/no):");
                    String dosPasos = sc.nextLine();

                    if(dosPasos.equalsIgnoreCase("si")) {
                        System.out.println("Autenticación en dos pasos activada.");
                    }

                    registrarAccion("Recuperación exitosa para: " + correo);
                } else {
                    System.out.println("Código incorrecto.");
                }
            } else {
                System.out.println("No se otorgó consentimiento. Proceso cancelado.");
            }
        } else {
            System.out.println("Correo no reconocido.");
        }

        sc.close();
    }

    // Función simulada para verificar correo
    public static boolean verificarCorreo(String correo) {
        // Aquí validas con base de datos, etc.
        return correo.equals("usuario@ejemplo.com");
    }

    // Función simulada para enviar código
    public static String enviarCodigo(String correo) {
        // Enviar email con código real en sistema real
        System.out.println("Enviando código a " + correo);
        return "123456"; // Código de ejemplo
    }

    // Función simulada para registrar acción
    public static void registrarAccion(String accion) {
        System.out.println("Registro: " + accion);
        // Guardar en archivo o base de datos en implementación real
    }
}