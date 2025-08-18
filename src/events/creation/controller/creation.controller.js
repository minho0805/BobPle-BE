import { ok } from '../../../utils/http.js';
import { parseCreateBody } from '../dto/request/creation.request.dto.js';
import * as svc from '../service/creation.service.js';

export async function creation(req,res,next){
  try{
    const dto = parseCreateBody(req.body);
    const data = await svc.create(dto, req.user);
    return ok(res, data);
  }catch(e){ next(e); }
}