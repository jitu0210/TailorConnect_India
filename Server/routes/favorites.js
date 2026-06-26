import { Router } from 'express'
import { protect } from '../middleware/auth.js'
import {
  listFavorites, addFavorite, removeFavorite, checkFavorite,
} from '../controllers/favorites.controller.js'

const router = Router()

router.get( '/',                   protect, listFavorites)
router.post('/:tailorId',          protect, addFavorite)
router.delete('/:tailorId',        protect, removeFavorite)
router.get( '/:tailorId/check',    protect, checkFavorite)

export default router
