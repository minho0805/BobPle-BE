import dotenv from "dotenv";
import { setupSwagger } from "./config/swagger.js";
import {
  setupCommonError,
  setupExpress,
  setupRouter,
} from "./config/express.js";

dotenv.config();

const app = setupExpress();
const port = process.env.PORT;

setupSwagger(app);
setupRouter(app);
setupCommonError(app);
app.listen(port, () => {
  console.log(`서버 열림 - 포트 : ${port}`);
});
