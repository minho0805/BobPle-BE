// src/index.js (정상 엔트리)
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

// (선택) 요청 로그
app.use((req, _res, next) => {
  console.log("[REQ]", req.method, req.originalUrl);
  next();
});

// 라우터 마운트
app.use(router);

// 에러 핸들러는 항상 마지막
setupCommonError(app);

app.listen(port, () => {
  console.log(`서버 열림 - 포트 : ${port}`);
});
