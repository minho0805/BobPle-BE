import { parseCreateBody } from '../dto/request/creation.request.dto.js';
import * as svc from '../service/creation.service.js';
import { StatusCodes } from 'http-status-codes';

export async function creation(req, res, next) {
  try {
    const dto = parseCreateBody(req.body);
    const data = await svc.creation(dto, req.user);
    // return ok(res, data);
    res.status(StatusCodes.OK).success(data);
  } catch (e) { next(e); }
}