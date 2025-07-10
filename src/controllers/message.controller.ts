import { Request, Response } from 'express';
import { sendTemplateMessage } from '../services/SendTemplate.service';
import { logInfo, logError } from '../utils/logger';

export const sendTemplate = async (req: Request, res: Response) => {
  const { to, templateName, language, parameters } = req.body;

  if (!to || !templateName || !language) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: to, templateName, language',
    });
  }

  try {
    const result = await sendTemplateMessage(to, templateName, language, parameters || []);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logError(`❌ Error in sendTemplate controller: ${error}`);
    return res.status(500).json({
      success: false,
      message: 'Error sending template message.',
    });
  }
};
