const express = require('express');
const router = express.Router();
const questions = require('../data/questions.json');

/**
 * GET /api/questionnaire/questions
 * 获取问卷题目
 */
router.get('/questions', (req, res) => {
  try {
    res.json({
      success: true,
      data: questions
    });
  } catch (error) {
    console.error('获取问卷错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

module.exports = router;
