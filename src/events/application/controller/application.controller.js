// src/events/application/controller/application.controller.js
import { StatusCodes } from 'http-status-codes';
import { apply, cancel, mine, cancelByApplicationId } from '../service/application.service.js';

import { PrismaClient } from '@prisma/client';
const prisma = globalThis.__prisma ?? new PrismaClient();
if (!globalThis.__prisma) globalThis.__prisma = prisma;
// 신청 생성
export const applyApplication = async (req, res, next) => {
  try {
    const eventId = Number(req.params.eventId);
    const data = await apply(eventId, req.user);
    return res.success(data, StatusCodes.CREATED); // 201
  } catch (e) { next(e); }
};

// 신청 취소 (legacy: me 또는 creatorId)
export const cancelApplication = async (req, res, next) => {
  try {
    const eventId = Number(req.params.eventId);
    // legacy 경로 2종을 모두 처리: /applications/me 혹은 /applications/:creatorId
    const creatorIdParam = req.params.creatorId || req.params.creator_id || 'me';
    const data = await cancel(eventId, creatorIdParam, req.user);
    return res.success(data, StatusCodes.OK);
  } catch (e) { next(e); }
};

// 🔸 신청 취소 (spec): applicationId 기반
export const cancelApplicationById = async (req, res, next) => {
  try {
    const eventId = Number(req.params.eventId);
    const applicationId = Number(req.params.applicationId);
    const data = await cancelByApplicationId(eventId, applicationId, req.user);
    return res.success(data, StatusCodes.OK);
  } catch (e) { next(e); }
};

// 내가 신청한 목록
export const myApplications = async (req, res, next) => {
  try {
    const data = await mine(req.user, req.query);
    return res.success(data, StatusCodes.OK);
  } catch (e) { next(e); }
};