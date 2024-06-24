// src/controllers/userController.js

const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const nodemailer = require("nodemailer"); // Asegúrate de tener esto instalado
const crypto = require("crypto");
const jwt = require('jsonwebtoken');

//Clave secreta para firmar el token JWT
const SECRET_KEY = "Est&deberi@serun@c0digos3guro!#*";
//Algoritmo de encriptación
ALGORITHM = 'HS256'
//Tiempo de expiración del token en minutos
ACCESS_TOKEN_EXPIRE_MINUTES = '1h'

const registerUser = async (req, res) => {
  const { username, password } = req.body;

  // Validación de campos vacíos
  if (!username || !password) {
    return res
      .status(400)
      .json({
        message:
          "Los campos de nombre de usuario y contraseña son obligatorios",
      });
  }

  // Validación del username
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(username)) {
    return res
      .status(400)
      .json({
        message: "El nombre de usuario debe ser un correo electrónico válido",
      });
  }

  // Validación de la contraseña
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@!"#$%&/()¿¡?!_])[A-Za-z\d@!"#$%&/()¿¡?!_]{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      message:
        'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo (@!"#$%&/()¿¡?!_).',
    });
  }

  try {
    const userExists = await User.findOne({ where: { username } });

    if (userExists) {
      return res.status(400).json({ message: "Usuario ya existe" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const verificationCode = crypto.randomBytes(20).toString("hex");

    await User.create({
      username,
      password_hash: passwordHash,
      verification_code: verificationCode,
      verification_expires_at: new Date(Date.now() + 3600000), // 1 hora de expiración
    });

    // Enviar correo de verificación
    const transporter = nodemailer.createTransport({
      service: "gmail", // o el servicio de correo que prefieras
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: username,
      subject: "Código de verificación de cuenta",
      text: `Tu código de verificación es: ${verificationCode}`,
    };

    await transporter.sendMail(mailOptions);

    res
      .status(201)
      .json({
        message: "Usuario creado, se ha enviado un correo de verificación",
      });
  } catch (error) {
    res.status(500).json({ message: "Error al crear usuario", error });
  }
};

const validateUser = async (req, res) => {
  const { username, verificationCode } = req.body;

  // Validación de campos vacíos
  if (!username || !verificationCode) {
    return res
      .status(400)
      .json({
        message:
          "Los campos de nombre de usuario y código de verificación son obligatorios",
      });
  }

  try {
    const user = await User.findOne({
      where: { username, verification_code: verificationCode },
    });

    if (!user) {
      return res
        .status(404)
        .json({
          message: "Usuario no encontrado o código de verificación incorrecto",
        });
    }

    // Verificar si el código ha expirado
    if (user.verification_expires_at < new Date()) {
      return res
        .status(400)
        .json({ message: "El código de verificación ha expirado" });
    }

    // Actualizar el estado del usuario a verificado
    user.is_verified = true;
    user.verification_code = null; // Limpiar el código de verificación
    user.verification_expires_at = null;
    await user.save();

    res.status(200).json({ message: "Usuario verificado con éxito" });
  } catch (error) {
    res.status(500).json({ message: "Error al validar usuario", error });
  }
};

const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    if (!user.is_active) {
      return res.status(403).json({ message: "Usuario desactivado" });
    }

    if (!user.is_verified) {
      return res.status(403).json({ message: "Usuario no verificado" });
    }

    // Verificar si ha pasado el tiempo de espera de 2 minutos desde el último intento fallido
    if (
      user.login_attempts >= 5 &&
      user.last_try_login &&
      new Date() - user.last_try_login < 120000
    ) {
      return res
        .status(429)
        .json({
          message:
            "Demasiados intentos. Por favor, inténtalo de nuevo más tarde.",
        });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      // Incrementar el contador de intentos de login y actualizar la hora del último intento fallido
      await user.update({
        login_attempts: user.login_attempts + 1,
        last_try_login: new Date(),
      });

      // Bloquear el login si se superan los intentos máximos
      if (user.login_attempts + 1 >= 5) {
        return res
          .status(429)
          .json({
            message:
              "Demasiados intentos. Por favor, inténtalo de nuevo más tarde.",
          });
      }

      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    // Resetear el contador de intentos de login y la hora del último intento de login si el usuario se loguea correctamente
    await user.update({
      login_attempts: 0,
      last_try_login: null,
      last_login: new Date(), // Actualizar la columna last_login con la fecha y hora actual
    });

    // Aquí puedes implementar la lógica para generar y manejar tokens de autenticación si lo deseas
    // Si las credenciales son válidas, generar un token JWT
    const token = jwt.sign({ username: user.username }, SECRET_KEY, { algorithm: ALGORITHM }, { expiresIn: ACCESS_TOKEN_EXPIRE_MINUTES }); // Cambia 'secreto' por tu clave secreta

    res.status(200).json({ message: "Login exitoso", token });
  } catch (error) {
    res.status(500).json({ message: "Error al realizar el login", error });
  }
};

const logoutUser = async (req, res) => {
  const { username } = req.body;

  try {
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Aquí puedes manejar la lógica de logout si tienes una sesión o token

    res.status(200).json({ message: "Logout exitoso" });
  } catch (error) {
    res.status(500).json({ message: "Error al cerrar sesión", error });
  }
};

const deleteUser = async (req, res) => {
  const { username } = req.body;

  try {
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    await user.destroy();

    res.status(200).json({ message: "Usuario eliminado" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar usuario", error });
  }
};

module.exports = {
  registerUser,
  validateUser,
  loginUser,
  logoutUser,
  deleteUser,
};
