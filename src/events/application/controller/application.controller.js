import { ok } from '../../../utils/http.js';
import * as svc from '../service/application.service.js';

export const apply = async (req,res,next)=>{ try{
  const d = await svc.apply(req.params.eventId, req.user); return ok(res,d);
}catch(e){ next(e);}};

export const cancel = async (req,res,next)=>{ try{
  const d = await svc.cancel(req.params.eventId, req.params.applicationId, req.user); return ok(res,d);
}catch(e){ next(e);}};

export const mine = async (req,res,next)=>{ try{
  const d = await svc.mine(req.user, req.query); return ok(res,d);
}catch(e){ next(e);}};