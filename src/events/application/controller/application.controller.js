import * as svc from '../service/application.service.js';

export const apply  = async (req, res, next) => { try { return ok(res, await svc.apply(req.params.eventId, req.user)); } catch (e) { next(e); } };
export const cancel = async (req, res, next) => { try { return ok(res, await svc.cancel(req.params.eventId, req.params.applicationId, req.user)); } catch (e) { next(e); } };
export const mine   = async (req, res, next) => { try { return ok(res, await svc.mine(req.user, req.query)); } catch (e) { next(e); } };