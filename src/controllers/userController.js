// src/controllers/userController.js


const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const nodemailer = require('nodemailer'); // Asegúrate de tener esto instalado
const crypto = require('crypto');


const registerUser = async (req, res) => {
  const { username, password } = req.body;

  // Validación de campos vacíos
  if (!username || !password) {
    return res.status(400).json({ message: 'Los campos de nombre de usuario y contraseña son obligatorios' });
  }

  // Validación del username
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(username)) {
    return res.status(400).json({ message: 'El nombre de usuario debe ser un correo electrónico válido' });
  }

  // Validación de la contraseña
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@!"#$%&/()¿¡?!_])[A-Za-z\d@!"#$%&/()¿¡?!_]{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({ 
      message: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo (@!"#$%&/()¿¡?!_).' 
    });
  }

  try {
    const userExists = await User.findOne({ where: { username } });

    if (userExists) {
      return res.status(400).json({ message: 'Usuario ya existe' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const verificationCode = crypto.randomBytes(20).toString('hex');

    await User.create({ 
      username, 
      password_hash: passwordHash,
      verification_code: verificationCode,
      verification_expires_at: new Date(Date.now() + 3600000) // 1 hora de expiración
    });

    // Enviar correo de verificación
    const transporter = nodemailer.createTransport({
      service: 'gmail', // o el servicio de correo que prefieras
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    console.log("Correo: ", process.env.EMAIL_USER,)
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: username,
      subject: 'Código de verificación de cuenta',
      text: `Tu código de verificación es: ${verificationCode}`
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ message: 'Usuario creado, se ha enviado un correo de verificación' });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear usuario', error });
  }
};

const validateUser = async (req, res) => {
  const { username } = req.body;

  try {
    const user = await User.findOne({ where: { username } });

    if (user) {
      return res.status(200).json({ message: 'Usuario válido' });
    }

    res.status(404).json({ message: 'Usuario no encontrado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al validar usuario', error });
  }
};

const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    user.last_login = new Date();
    await user.save();

    res.status(200).json({ message: 'Login exitoso' });
  } catch (error) {
    res.status(500).json({ message: 'Error al iniciar sesión', error });
  }
};

const logoutUser = async (req, res) => {
  const { username } = req.body;

  try {
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Aquí puedes manejar la lógica de logout si tienes una sesión o token

    res.status(200).json({ message: 'Logout exitoso' });
  } catch (error) {
    res.status(500).json({ message: 'Error al cerrar sesión', error });
  }
};

const deleteUser = async (req, res) => {
  const { username } = req.body;

  try {
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    await user.destroy();

    res.status(200).json({ message: 'Usuario eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar usuario', error });
  }
};

module.exports = {
  registerUser,
  validateUser,
  loginUser,
  logoutUser,
  deleteUser,
};
