/**
 * Backend API Routes Router
 * Exposes proxy endpoints while protecting internal business logic.
 * All quantitative and prediction routes strictly require cryptographic token verification.
 */

import { Router } from 'express';
import { handleSessionCheck, handleSessionInit, handleLogout } from '../controllers/authController.ts';
import { computeActiveSignal } from '../controllers/signalController.ts';
import { handleSystemStatus, handleTelemetryReport } from '../controllers/systemController.ts';
import { fetchVip24Logics } from '../controllers/vip24Controller.ts';
import { handleBotQuery, handleBotPrediction } from '../controllers/brainController.ts';
import {
  handleVerifyLicense,
  handleGetPublicSettings,
  handleGetCloneSettings,
  handleDeviceHeartbeat,
  handleCheckLicenseStatus,
} from '../controllers/licenseController.ts';
import {
  adminAuthMiddleware,
  handleVerifyAdminPin,
  getAdminDashboard,
  handleCreateLicense,
  handleDeleteLicense,
  handleToggleLicense,
  handleUpdateSettings,
  handleAddIp,
  handleRemoveIp,
  handleCreateClone,
  handleDeleteClone,
  handleGetDevices,
  handleKickDevice,
  handleKickAllDevices,
} from '../controllers/adminController.ts';
import {
  tokenAuthMiddleware,
  generateSecurityToken,
  verifySecurityToken,
} from '../middleware/tokenAuth.ts';

export const apiRouter = Router();

// ==========================================
// 1. Authentication & Token Handshake (Public)
// ==========================================
apiRouter.get('/auth/session', handleSessionCheck);
apiRouter.post('/auth/session', handleSessionInit);
apiRouter.post('/auth/logout', handleLogout);

/**
 * Token Handshake: Client exchanges handshake for HMAC-SHA256 signed access token
 */
apiRouter.post('/auth/token/handshake', (req, res) => {
  const clientFingerprint = req.body?.fingerprint || req.headers['user-agent'] || 'anonymous';
  const tokenData = generateSecurityToken(clientFingerprint);

  res.json({
    success: true,
    token: tokenData.token,
    expiresAt: tokenData.expiresAt,
    scope: 'VIP_ENGINE_ACCESS',
    serverTime: Date.now(),
    algorithm: 'HMAC-SHA256',
  });
});

/**
 * Token Refresh: Refresh an existing valid or near-expiry token
 */
apiRouter.post('/auth/token/refresh', (req, res) => {
  const currentToken =
    req.headers['x-security-token'] ||
    req.headers['x-auth-token'] ||
    (req.headers['authorization']?.startsWith('Bearer ')
      ? req.headers['authorization'].slice(7)
      : undefined);

  if (!currentToken || typeof currentToken !== 'string') {
    res.status(401).json({ error: 'TOKEN_REQUIRED', message: 'Current token required for refresh' });
    return;
  }

  const verified = verifySecurityToken(currentToken);
  if (!verified.valid || !verified.payload) {
    res.status(403).json({ error: 'TOKEN_INVALID', message: 'Cannot refresh invalid token' });
    return;
  }

  const newToken = generateSecurityToken(verified.payload.sessionId);
  res.json({
    success: true,
    token: newToken.token,
    expiresAt: newToken.expiresAt,
    serverTime: Date.now(),
  });
});

// =======================================================
// 2. Public Password & License Validation Routes
// =======================================================
apiRouter.post('/license/verify', handleVerifyLicense);
apiRouter.post('/license/heartbeat', handleDeviceHeartbeat);
apiRouter.get('/license/status', handleCheckLicenseStatus);
apiRouter.get('/license/settings', handleGetPublicSettings);
apiRouter.get('/clone/:slug', handleGetCloneSettings);

// =======================================================
// 3. Admin Panel API Routes (Strict PIN Protected Lock)
// =======================================================
apiRouter.post('/admin/auth/verify-pin', handleVerifyAdminPin);
apiRouter.get('/admin/dashboard', adminAuthMiddleware, getAdminDashboard);
apiRouter.get('/admin/devices', adminAuthMiddleware, handleGetDevices);
apiRouter.post('/admin/devices/kick', adminAuthMiddleware, handleKickDevice);
apiRouter.post('/admin/devices/kick-all', adminAuthMiddleware, handleKickAllDevices);
apiRouter.post('/admin/keys/create', adminAuthMiddleware, handleCreateLicense);
apiRouter.post('/admin/keys/delete', adminAuthMiddleware, handleDeleteLicense);
apiRouter.post('/admin/keys/toggle', adminAuthMiddleware, handleToggleLicense);
apiRouter.post('/admin/licenses/create', adminAuthMiddleware, handleCreateLicense);
apiRouter.post('/admin/licenses/delete', adminAuthMiddleware, handleDeleteLicense);
apiRouter.post('/admin/licenses/toggle', adminAuthMiddleware, handleToggleLicense);
apiRouter.post('/admin/settings/update', adminAuthMiddleware, handleUpdateSettings);
apiRouter.post('/admin/ips/add', adminAuthMiddleware, handleAddIp);
apiRouter.post('/admin/ips/remove', adminAuthMiddleware, handleRemoveIp);
apiRouter.post('/admin/clones/create', adminAuthMiddleware, handleCreateClone);
apiRouter.post('/admin/clones/delete', adminAuthMiddleware, handleDeleteClone);

// =======================================================
// 4. Token Protection Guard for All Internal Engine APIs
// =======================================================
apiRouter.use(tokenAuthMiddleware);

// =======================================================
// 5. Proprietary Protected Wingo Signals & VIP Logics
// =======================================================
apiRouter.get('/signals/active', (req, res) => {
  const signal = computeActiveSignal();
  res.json(signal);
});

apiRouter.get('/vip24/logics', fetchVip24Logics);

// =======================================================
// 6. Server-Side AI Brain Engine (CyberBot)
// =======================================================
apiRouter.post('/bot/query', handleBotQuery);
apiRouter.get('/bot/prediction', handleBotPrediction);

// =======================================================
// 7. System Telemetry & Time Sync
// =======================================================
apiRouter.get('/system/status', handleSystemStatus);
apiRouter.post('/telemetry/report', handleTelemetryReport);
