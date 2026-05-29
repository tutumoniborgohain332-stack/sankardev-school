import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import studentsRouter from "./students";
import staffRouter from "./staff";
import galleryRouter from "./gallery";
import newsRouter from "./news";
import admissionsRouter from "./admissions";
import statsRouter from "./stats";
import resultsRouter from "./results";
import attendanceRouter from "./attendance";
import settingsRouter from "./settings";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(studentsRouter);
router.use(staffRouter);
router.use(galleryRouter);
router.use(newsRouter);
router.use(admissionsRouter);
router.use(statsRouter);
router.use(resultsRouter);
router.use(attendanceRouter);
router.use(settingsRouter);

export default router;
