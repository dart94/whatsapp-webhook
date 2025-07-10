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

  const recipients = Array.isArray(to) ? to : [to];

  try {
    const results = [];

    for (const phone of recipients) {
      const result = await sendTemplateMessage(phone, templateName, language, parameters || []);
      results.push({
        to: phone,
        result,
      });
    }

    return res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    logError(`❌ Error in sendTemplate controller: ${error}`);
    return res.status(500).json({
      success: false,
      message: 'Error sending template message.',
    });
  }
};
