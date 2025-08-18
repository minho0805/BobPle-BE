import { ok } from '../../../utils/http.js';
import * as svc from '../service/event.service.js';
import { parseUpdateBody } from '../dto/request/event.request.dto.js';

export const list = async (req,res,next)=>{ try{ return ok(res, await svc.list(req.query)); }catch(e){ next(e);} };
export const detail = async (req,res,next)=>{ try{ return ok(res, await svc.detail(req.params.eventId)); }catch(e){ next(e);} };
export const edit = async (req,res,next)=>{ try{ return ok(res, await svc.edit(req.params.eventId, parseUpdateBody(req.body), req.user)); }catch(e){ next(e);} };
export const cancel = async (req,res,next)=>{ try{ return ok(res, await svc.cancel(req.params.eventId, req.user)); }catch(e){ next(e);} };