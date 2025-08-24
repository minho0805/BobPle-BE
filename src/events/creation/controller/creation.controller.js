// src/events/creation/controller/creation.controller.js
import { StatusCodes } from 'http-status-codes';
import { parseCreateBody } from '../dto/request/creation.request.dto.js';
import * as svc from '../service/creation.service.js';
import { PrismaClient } from '@prisma/client';
const prisma = globalThis.__prisma ?? new PrismaClient();
if (!globalThis.__prisma) globalThis.__prisma = prisma;

// POST /api/events/creation
export async function createEvent(req, res, next) {
  try {
    const dto = parseCreateBody(req.body);
    const data = await svc.create(dto, req.user); // ← 함수 이름 create
    return res.success(data, 201);
  } catch (e) { next(e); }
}