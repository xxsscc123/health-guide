// 体质类型定义
const constitutionTypes = {
  '平和质': { name: '平和质', description: '健康体质，阴阳气血调和' },
  '气虚质': { name: '气虚质', description: '元气不足，容易疲劳' },
  '阳虚质': { name: '阳虚质', description: '阳气不足，畏寒怕冷' },
  '阴虚质': { name: '阴虚质', description: '阴液亏损，手脚心热' },
  '痰湿质': { name: '痰湿质', description: '体型肥胖，痰湿内蕴' },
  '湿热质': { name: '湿热质', description: '湿热内蕴，面部油腻' },
  '血瘀质': { name: '血瘀质', description: '血行不畅，肤色晦暗' },
  '气郁质': { name: '气郁质', description: '气机郁滞，情绪低落' },
  '特禀质': { name: '特禀质', description: '过敏体质，易过敏' }
};

// 舌苔特征与体质对应关系
const tongueConstitutionMap = {
  // 格式: "舌色-苔色-苔质-舌体"
  '淡白-白-薄-正常': { constitution: '气虚质', score: 70 },
  '淡白-白-薄-胖大': { constitution: '阳虚质', score: 85 },
  '淡白-白-厚-胖大': { constitution: '痰湿质', score: 80 },
  '淡红-白-薄-正常': { constitution: '平和质', score: 90 },
  '红-少苔--瘦薄': { constitution: '阴虚质', score: 85 },
  '红-黄-厚腻-正常': { constitution: '湿热质', score: 85 },
  '红-黄-腻-胖大': { constitution: '痰湿质', score: 80 },
  '暗红---正常': { constitution: '血瘀质', score: 80 },
  '青紫---瘦薄': { constitution: '血瘀质', score: 85 },
  '淡红-薄白-薄-正常': { constitution: '平和质', score: 85 }
};

/**
 * 分析舌苔特征
 * @param {Object} tongueData - 舌苔数据
 * @returns {Object} 体质得分
 */
function analyzeTongue(tongueData) {
  const scores = {};

  // 初始化所有体质分数为0
  Object.keys(constitutionTypes).forEach(type => {
    scores[type] = 0;
  });

  const { color, coating, quality, body, crack } = tongueData;

  // 组合特征进行匹配
  const key = `${color || ''}-${coating || ''}-${quality || ''}-${body || ''}`;

  // 完全匹配
  if (tongueConstitutionMap[key]) {
    const match = tongueConstitutionMap[key];
    scores[match.constitution] = match.score;
  } else {
    // 部分匹配规则
    // 舌色匹配
    if (color === '淡白') {
      scores['气虚质'] += 30;
      scores['阳虚质'] += 25;
    } else if (color === '红' || color === '绛红') {
      scores['阴虚质'] += 30;
      scores['湿热质'] += 20;
    } else if (color === '青紫' || color === '暗红') {
      scores['血瘀质'] += 40;
    } else if (color === '淡红') {
      scores['平和质'] += 30;
    }

    // 苔色匹配
    if (coating === '黄') {
      scores['湿热质'] += 30;
    } else if (coating === '白' && quality === '厚腻') {
      scores['痰湿质'] += 35;
    } else if (coating === '少苔' || coating === '无苔') {
      scores['阴虚质'] += 25;
    }

    // 舌体匹配
    if (body === '胖大') {
      scores['痰湿质'] += 25;
      scores['阳虚质'] += 20;
    } else if (body === '瘦薄') {
      scores['阴虚质'] += 25;
      scores['血瘀质'] += 15;
    }

    // 裂纹匹配
    if (crack === '有') {
      scores['阴虚质'] += 20;
    }
  }

  return scores;
}

/**
 * 分析问卷答案
 * @param {Array} answers - 问卷答案数组
 * @returns {Object} 体质得分
 */
function analyzeQuestionnaire(answers) {
  const scores = {};

  // 初始化所有体质分数为0
  Object.keys(constitutionTypes).forEach(type => {
    scores[type] = 0;
  });

  // 遍历每个答案并累加分数
  answers.forEach(answer => {
    const { questionId, value } = answer;

    // 根据问题和答案计算分数
    const questionScores = getQuestionScores(questionId, value);

    Object.keys(questionScores).forEach(type => {
      scores[type] += questionScores[type];
    });
  });

  return scores;
}

/**
 * 获取问题的体质得分
 * @param {String} questionId - 问题ID
 * @param {Number} value - 答案值（1-5）
 * @returns {Object} 体质得分
 */
function getQuestionScores(questionId, value) {
  // 完整的30题体质映射关系
  const scoreMap = {
    // q1: 疲劳、乏力 -> 气虚质
    q1: {
      5: { 气虚质: 5, 阳虚质: 2 },
      4: { 气虚质: 4, 阳虚质: 1 },
      3: { 气虚质: 2 },
      2: { 平和质: 2 },
      1: { 平和质: 4 }
    },
    // q2: 怕冷、手脚冰凉 -> 阳虚质
    q2: {
      5: { 阳虚质: 5, 气虚质: 1 },
      4: { 阳虚质: 4 },
      3: { 阳虚质: 2 },
      2: { 平和质: 2 },
      1: { 平和质: 4 }
    },
    // q3: 手脚心热、口干咽燥 -> 阴虚质
    q3: {
      5: { 阴虚质: 5 },
      4: { 阴虚质: 4 },
      3: { 阴虚质: 2 },
      2: { 平和质: 2 },
      1: { 平和质: 4 }
    },
    // q4: 体型偏胖、腹部松软 -> 痰湿质
    q4: {
      5: { 痰湿质: 5 },
      4: { 痰湿质: 4 },
      3: { 痰湿质: 2 },
      2: { 平和质: 2 },
      1: { 平和质: 4 }
    },
    // q5: 面部出油、长痘 -> 湿热质
    q5: {
      5: { 湿热质: 5 },
      4: { 湿热质: 4 },
      3: { 湿热质: 2 },
      2: { 平和质: 2 },
      1: { 平和质: 4 }
    },
    // q6: 情绪低落、郁闷 -> 气郁质
    q6: {
      5: { 气郁质: 5 },
      4: { 气郁质: 4 },
      3: { 气郁质: 2 },
      2: { 平和质: 2 },
      1: { 平和质: 4 }
    },
    // q7: 容易过敏 -> 特禀质
    q7: {
      5: { 特禀质: 5 },
      4: { 特禀质: 4 },
      3: { 特禀质: 2 },
      2: { 平和质: 2 },
      1: { 平和质: 4 }
    },
    // q8: 肤色晦暗、色斑 -> 血瘀质
    q8: {
      5: { 血瘀质: 5 },
      4: { 血瘀质: 4 },
      3: { 血瘀质: 2 },
      2: { 平和质: 2 },
      1: { 平和质: 4 }
    },
    // q9: 气短 -> 气虚质
    q9: {
      5: { 气虚质: 5 },
      4: { 气虚质: 4 },
      3: { 气虚质: 2 },
      2: { 平和质: 2 },
      1: { 平和质: 4 }
    },
    // q10: 容易感冒、恢复慢 -> 气虚质、特禀质
    q10: {
      5: { 气虚质: 4, 特禀质: 3 },
      4: { 气虚质: 3, 特禀质: 2 },
      3: { 气虚质: 1 },
      2: { 平和质: 2 },
      1: { 平和质: 4 }
    },
    // q11: 失眠、多梦 -> 阴虚质、气郁质
    q11: {
      5: { 阴虚质: 3, 气郁质: 3 },
      4: { 阴虚质: 2, 气郁质: 2 },
      3: { 阴虚质: 1, 气郁质: 1 },
      2: { 平和质: 2 },
      1: { 平和质: 4 }
    },
    // q12: 食欲差、腹胀 -> 气虚质、痰湿质
    q12: {
      5: { 气虚质: 3, 痰湿质: 3 },
      4: { 气虚质: 2, 痰湿质: 2 },
      3: { 气虚质: 1 },
      2: { 平和质: 2 },
      1: { 平和质: 4 }
    },
    // q13: 容易出汗 -> 气虚质、阳虚质（自汗）、阴虚质（盗汗）
    q13: {
      5: { 气虚质: 3, 阳虚质: 2, 阴虚质: 2 },
      4: { 气虚质: 2, 阳虚质: 1, 阴虚质: 1 },
      3: { 平和质: 1 },
      2: { 平和质: 2 },
      1: { 平和质: 3 }
    },
    // q14: 口苦、口臭 -> 湿热质
    q14: {
      5: { 湿热质: 5 },
      4: { 湿热质: 4 },
      3: { 湿热质: 2 },
      2: { 平和质: 2 },
      1: { 平和质: 4 }
    },
    // q15: 头晕、头痛 -> 气虚质、血瘀质、气郁质
    q15: {
      5: { 气虚质: 2, 血瘀质: 2, 气郁质: 2 },
      4: { 气虚质: 1, 血瘀质: 1, 气郁质: 1 },
      3: { 气虚质: 1 },
      2: { 平和质: 2 },
      1: { 平和质: 4 }
    },
    // q16: 紧张、焦虑 -> 气郁质
    q16: {
      5: { 气郁质: 5 },
      4: { 气郁质: 4 },
      3: { 气郁质: 2 },
      2: { 平和质: 2 },
      1: { 平和质: 4 }
    },
    // q17: 身体沉重 -> 痰湿质、湿热质
    q17: {
      5: { 痰湿质: 4, 湿热质: 3 },
      4: { 痰湿质: 3, 湿热质: 2 },
      3: { 痰湿质: 1 },
      2: { 平和质: 2 },
      1: { 平和质: 4 }
    },
    // q18: 腰酸背痛 -> 阳虚质、气虚质、血瘀质
    q18: {
      5: { 阳虚质: 3, 气虚质: 2, 血瘀质: 2 },
      4: { 阳虚质: 2, 气虚质: 1, 血瘀质: 1 },
      3: { 阳虚质: 1 },
      2: { 平和质: 2 },
      1: { 平和质: 4 }
    },
    // q19: 便秘或腹泻 -> 阳虚质（腹泻）、阴虚质（便秘）、湿热质（便秘）
    q19: {
      5: { 阳虚质: 2, 阴虚质: 2, 湿热质: 2 },
      4: { 阳虚质: 1, 阴虚质: 1, 湿热质: 1 },
      3: { 平和质: 1 },
      2: { 平和质: 2 },
      1: { 平和质: 4 }
    },
    // q20: 季节变化易生病 -> 气虚质、特禀质
    q20: {
      5: { 气虚质: 3, 特禀质: 3 },
      4: { 气虚质: 2, 特禀质: 2 },
      3: { 气虚质: 1 },
      2: { 平和质: 2 },
      1: { 平和质: 4 }
    },
    // q21: 胸闷、叹气 -> 气郁质、血瘀质
    q21: {
      5: { 气郁质: 4, 血瘀质: 2 },
      4: { 气郁质: 3, 血瘀质: 1 },
      3: { 气郁质: 1 },
      2: { 平和质: 2 },
      1: { 平和质: 4 }
    },
    // q22: 眼睛干涩 -> 阴虚质、血瘀质
    q22: {
      5: { 阴虚质: 4, 血瘀质: 2 },
      4: { 阴虚质: 3, 血瘀质: 1 },
      3: { 阴虚质: 1 },
      2: { 平和质: 2 },
      1: { 平和质: 4 }
    },
    // q23: 四肢麻木 -> 血瘀质、气虚质
    q23: {
      5: { 血瘀质: 4, 气虚质: 2 },
      4: { 血瘀质: 3, 气虚质: 1 },
      3: { 血瘀质: 1 },
      2: { 平和质: 2 },
      1: { 平和质: 4 }
    },
    // q24: 烦躁易怒 -> 气郁质、阴虚质、湿热质
    q24: {
      5: { 气郁质: 3, 阴虚质: 2, 湿热质: 2 },
      4: { 气郁质: 2, 阴虚质: 1, 湿热质: 1 },
      3: { 气郁质: 1 },
      2: { 平和质: 2 },
      1: { 平和质: 4 }
    },
    // q25: 心慌、心悸 -> 气虚质、阴虚质、气郁质
    q25: {
      5: { 气虚质: 2, 阴虚质: 2, 气郁质: 2 },
      4: { 气虚质: 1, 阴虚质: 1, 气郁质: 1 },
      3: { 气虚质: 1 },
      2: { 平和质: 2 },
      1: { 平和质: 4 }
    },
    // q26: 嘴唇暗淡或发紫 -> 血瘀质、气虚质
    q26: {
      5: { 血瘀质: 5, 气虚质: 1 },
      4: { 血瘀质: 4 },
      3: { 血瘀质: 2 },
      2: { 平和质: 2 },
      1: { 平和质: 4 }
    },
    // q27: 容易出现淤青 -> 血瘀质
    q27: {
      5: { 血瘀质: 5 },
      4: { 血瘀质: 4 },
      3: { 血瘀质: 2 },
      2: { 平和质: 2 },
      1: { 平和质: 4 }
    },
    // q28: 体重易增加难减轻 -> 痰湿质
    q28: {
      5: { 痰湿质: 5 },
      4: { 痰湿质: 4 },
      3: { 痰湿质: 2 },
      2: { 平和质: 2 },
      1: { 平和质: 4 }
    },
    // q29: 咽喉不适、有痰 -> 痰湿质、阴虚质
    q29: {
      5: { 痰湿质: 4, 阴虚质: 2 },
      4: { 痰湿质: 3, 阴虚质: 1 },
      3: { 痰湿质: 1 },
      2: { 平和质: 2 },
      1: { 平和质: 4 }
    },
    // q30: 恶心、呕吐 -> 痰湿质、湿热质
    q30: {
      5: { 痰湿质: 3, 湿热质: 3 },
      4: { 痰湿质: 2, 湿热质: 2 },
      3: { 痰湿质: 1 },
      2: { 平和质: 2 },
      1: { 平和质: 4 }
    }
  };

  return scoreMap[questionId] ? scoreMap[questionId][value] || {} : {};
}

/**
 * 综合分析体质
 * @param {Object} tongueData - 舌苔数据
 * @param {Array} questionnaireData - 问卷数据
 * @returns {Object} 分析结果
 */
function analyzeConstitution(tongueData, questionnaireData) {
  const tongueScores = analyzeTongue(tongueData);
  const questionScores = analyzeQuestionnaire(questionnaireData);

  const finalScores = {};

  // 综合计算：舌苔30% + 问卷70%
  Object.keys(constitutionTypes).forEach(type => {
    finalScores[type] = (tongueScores[type] || 0) * 0.3 + (questionScores[type] || 0) * 0.7;
  });

  // 排序得到主要体质和次要体质
  const sorted = Object.entries(finalScores)
    .sort((a, b) => b[1] - a[1]);

  const primary = sorted[0];
  const secondary = sorted[1];

  // 计算主要体质的百分比
  const totalScore = sorted.reduce((sum, item) => sum + item[1], 0);
  const primaryPercentage = totalScore > 0 ? Math.round((primary[1] / totalScore) * 100) : 0;

  return {
    primary: {
      type: primary[0],
      score: Math.round(primary[1]),
      percentage: primaryPercentage
    },
    secondary: {
      type: secondary[0],
      score: Math.round(secondary[1]),
      percentage: totalScore > 0 ? Math.round((secondary[1] / totalScore) * 100) : 0
    },
    allScores: finalScores,
    analysis: {
      tongueScores,
      questionScores
    }
  };
}

module.exports = {
  constitutionTypes,
  analyzeTongue,
  analyzeQuestionnaire,
  analyzeConstitution
};
