/**
 * services/auth.service.ts — Authentication Logic (Prisma 6)
 */
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "./prisma.service";
import { env } from "../config/env";
import type { Role } from "@prisma/client";

const SALT_ROUNDS = 12;

interface RegisterInput {
  email: string;
  password: string;
  name: string;
  role: Role;
}

interface LoginInput {
  email: string;
  password: string;
}

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export async function registerUser(input: RegisterInput) {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });
  if (existing) throw new AppError("Email sudah terdaftar", 409);

  const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      password: hashedPassword,
      name: input.name,
      role: input.role,
      learningProgress: 0,
    },
    select: {
      id: true, email: true, name: true, role: true,
      tier: true, riskProfile: true, learningProgress: true, createdAt: true,
    },
  });

  const token = generateToken({ userId: user.id, email: user.email, role: user.role });
  return { user, token };
}

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) throw new AppError("Email atau password salah", 401);

  const isMatch = await bcrypt.compare(input.password, user.password);
  if (!isMatch) throw new AppError("Email atau password salah", 401);

  const token = generateToken({ userId: user.id, email: user.email, role: user.role });
  return {
    user: {
      id: user.id, email: user.email, name: user.name, role: user.role,
      tier: user.tier, riskProfile: user.riskProfile,
      learningProgress: user.learningProgress, createdAt: user.createdAt,
    },
    token,
  };
}

export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true, email: true, name: true, role: true,
      tier: true, riskProfile: true, learningProgress: true, createdAt: true,
    },
  });
  if (!user) throw new AppError("User tidak ditemukan", 404);
  return user;
}

function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as any });
}

export function verifyToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
  } catch {
    throw new AppError("Token tidak valid atau sudah kedaluwarsa", 401);
  }
}

export class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = "AppError";
  }
}
