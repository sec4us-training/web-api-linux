const express = require('express')
const config  = require('../../config');

const { 
  createUser, 
  updateUser,
  getUsers, 
  verifyEmail,
  authenticate,
  getUserById,
  logout,
  recoveryPassword,
  resetPassword,
  uploadFile,
  deleteUser,
} = require('../controllers/UserController')

const { 
  verifyJWT,
  general,
  generalUsers,
  jwtInfo
} = require('../controllers/general')

const router = express.Router()

router.get(config.basePath + '', general)
router.get(config.basePath + 'jwtinfo', jwtInfo)
//router.get(config.basePath + 'users', generalUsers)
router.post(config.basePath + 'users/create', createUser)
router.get(config.basePath + 'users/list', getUsers)
router.post(config.basePath + 'users/authenticate', authenticate)
router.get(config.basePath + 'users/verify/:email', verifyEmail)
router.post(config.basePath + 'users/recovery-password', recoveryPassword)
router.post(config.basePath + 'users/reset-password', resetPassword)
router.get(config.basePath + 'users/:id', verifyJWT, getUserById)
router.patch(config.basePath + 'users/:id', verifyJWT, updateUser)
router.delete(config.basePath + 'users/:id', verifyJWT, deleteUser)
router.post(config.basePath + 'users/:id/profile', verifyJWT, uploadFile)
//router.get(config.basePath + 'users/logout', verifyJWT, logout)


module.exports = router
