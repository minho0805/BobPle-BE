import { StatusCodes } from 'http-status-codes';
import * as svc from '../service/event.service.js';
import {
  parseListQuery,
  parseEventIdParam,
  parseEditBody,
} from '../dto/request/event.request.dto.js';

// GET /api/events
export async function list(req, res, next) {
  try {
    const dto = parseListQuery(req.query);
    const data = await svc.list(dto);
    return res.success(data, StatusCodes.OK);
  } catch (e) { next(e); }
}

// GET /api/events/:eventId
export async function detail(req, res, next) {
  try {
    const { eventId } = parseEventIdParam(req.params);
    const data = await svc.detail(eventId);
    return res.success(data, StatusCodes.OK);
  } catch (e) { next(e); }
}

// PATCH /api/events/:eventId/edit
export async function edit(req, res, next) {
  try {
    const { eventId } = parseEventIdParam(req.params);
    const body = parseEditBody(req.body);
    const data = await svc.edit(eventId, body, req.user);
    return res.success(data, StatusCodes.OK);
  } catch (e) { next(e); }
}

// POST /api/events/:eventId/cancel
export async function cancel(req, res, next) {
  try {
    const { eventId } = parseEventIdParam(req.params);
    const data = await svc.cancel(eventId, req.user);
    return res.success(data, StatusCodes.OK);
  } catch (e) { next(e); }
}