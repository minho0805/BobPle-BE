import dotenv from "dotenv";
import { setupSwagger } from "./config/swagger.js";
import { setupCommonError, setupExpress } from "./config/express.js";
import { setupFirebase } from "./config/firebase.js";
import router from "./router/router.js";

dotenv.config();

const app = setupExpress();
const port = process.env.PORT || 3000;

setupFirebase();
setupSwagger(app);

// 요청 로깅 (개발용)
app.use((req, _res, next) => {
  console.log("[REQ]", req.method, req.originalUrl);
  next();
});

// ✅ 모든 라우터를 한 번에 마운트
app.use(router);

// ✅ 에러 핸들러는 항상 마지막
setupCommonError(app);

app.listen(port, () => {
  console.log(`서버 열림 - 포트 : ${port}`);
});
