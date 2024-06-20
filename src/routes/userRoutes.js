// src/routes/userRoutes.js

const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Crear un nuevo usuario y envia un codigo de verificación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "info@odin.com"
 *               password:
 *                 type: string
 *                 example: "Inf0m@cion_2024"
 *     responses:
 *       201:
 *         description: Usuario creado
 *       400:
 *         description: Usuario ya existe o datos inválidos
 *       500:
 *         description: Error al crear usuario
 */
router.post('/register', userController.registerUser);

/**
 * @swagger
 * /validate:
 *   post:
 *     summary: Valida el usuario mediante el codigo emitido por correo electronico al registrarse.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "info@odin.com"
 *               verificationCode:
 *                 type: string
 *                 example: "20caracteresaleatorios"
 *     responses:
 *       200:
 *         description: Usuario verificado con éxito
 *       400:
 *         description: Código de verificación ha expirado o campos obligatorios faltantes
 *       404:
 *         description: Usuario no encontrado o código de verificación incorrecto
 *       500:
 *         description: Error al validar usuario
 */
router.post('/validate', userController.validateUser);

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Iniciar sesión
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login exitoso
 *       401:
 *         description: Credenciales inválidas
 */
router.post('/login', userController.loginUser);

/**
 * @swagger
 * /logout:
 *   post:
 *     summary: Cerrar sesión
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logout exitoso
 */
router.post('/logout', userController.logoutUser);

/**
 * @swagger
 * /delete:
 *   delete:
 *     summary: Eliminar un usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuario eliminado
 */
router.delete('/delete', userController.deleteUser);

module.exports = router;
