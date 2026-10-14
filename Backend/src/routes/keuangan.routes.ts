import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import tarifRoutes from './tarif.routes';
import tagihanRoutes from './tagihan.routes';
import pembayaranRoutes from './pembayaran.routes';
import tabunganRoutes from './tabungan.routes';
import jurnalKasRoutes from './jurnalKas.routes';

const router = Router();

router.use(authenticate);

router.use(tarifRoutes);
router.use(tagihanRoutes);
router.use(pembayaranRoutes);
router.use(tabunganRoutes);
router.use(jurnalKasRoutes);

export default router;