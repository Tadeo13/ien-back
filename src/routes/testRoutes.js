const { Router } = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const { preguntas, responder, resultados } = require('../controllers/testController');

const router = Router();
router.use(authMiddleware);

router.get('/preguntas', preguntas);
router.post('/responder', responder);
router.get('/resultados', resultados);

module.exports = router;
