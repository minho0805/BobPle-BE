import { InvalidInputValueError } from "../../error.js";
import { clearTokenCookies, setTokenCookies } from "../../utils/cookie.js";
import {
  loginRequestDto,
  logoutRequestDto,
  refreshRequestDto,
} from "../dto/request/auth.request.dto.js";
import { logout, refresh, verifyIdToken } from "../service/auth.service.js";
import { StatusCodes } from "http-status-codes";

export const handleLogin = async (req, res, next) => {
  /*
    #swagger.summary = "로그인"
    #swagger.tags = ['Auth']
    #swagger.requestBody = {
      required: true,
      content:{
        "application/json" :{
          schema:{
            type:"object",
            properties:{
              idToken:{
                type:"string",
              }
            }
          }
        }
      }
    }
  */
  if (!req.body.idToken) {
    throw new InvalidInputValueError("ID 토큰이 필요합니다.");
  }
  const login = await verifyIdToken(loginRequestDto(req.body));
  setTokenCookies(res, login.tokens.access, login.tokens.refresh);
  res.status(StatusCodes.OK).success(login.user);
};
export const handleLogout = async (req, res, next) => {
  /*
    #swagger.summary = "로그아웃"
    #swagger.tags = ['Auth']
  */
  await logout(logoutRequestDto(req.cookies));
  clearTokenCookies(res);
  res.status(StatusCodes.OK).success(null);
};
export const handleRefresh = async (req, res, next) => {
  /*
    #swagger.summary = "토큰 리프레시"
    #swagger.tags = ['Auth']
  */
  const accessToken = await refresh(refreshRequestDto(req.cookies));
  setTokenCookies(res, accessToken.accessToken, null);
  res.status(StatusCodes.OK).success(null);
};
