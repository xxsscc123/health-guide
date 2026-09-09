const express = require('express');
const router = express.Router();
const { analyzeConstitution } = require('../services/constitution');
const plans = require('../data/plans.json');

/**
 * POST /api/constitution/analyze
 * 分析体质
 */
router.post('/analyze', (req, res) => {
  try {
    const { tongueData, questionnaireData } = req.body;

    if (!tongueData || !questionnaireData) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      });
    }

    // 分析体质
    const result = analyzeConstitution(tongueData, questionnaireData);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('体质分析错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

/**
 * GET /api/constitution/plan/:type
 * 获取调理方案
 */
router.get('/plan/:type', (req, res) => {
  try {
    const { type } = req.params;

    const plan = plans[type];

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: '未找到该体质的调理方案'
      });
    }

    res.json({
      success: true,
      data: plan
    });
  } catch (error) {
    console.error('获取调理方案错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

module.exports = router;
