import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 模拟音频分析函数
export function analyzeAudioFile(file: File): Promise<AnalysisResult> {
  return new Promise((resolve) => {
    // 模拟分析延迟
    setTimeout(() => {
      // 生成模拟分析结果
      const pitchAccuracy = 65 + Math.random() * 30; // 65-95%
      const rhythmAccuracy = 60 + Math.random() * 35; // 60-95%
      const dynamicsRange = 15 + Math.random() * 25; // 15-40dB
      const vocalStability = 55 + Math.random() * 40; // 55-95%
      
      // 生成音高跟踪数据
      const pitchData = Array.from({ length: 50 }, (_, i) => ({
        time: i * 0.1,
        pitch: 220 + Math.random() * 440 + Math.sin(i * 0.2) * 50,
        target: 220 + Math.random() * 440
      }));
      
      // 生成节奏数据
      const rhythmData = Array.from({ length: 20 }, (_, i) => ({
        beat: i + 1,
        accuracy: 70 + Math.random() * 25,
        timingOffset: (Math.random() - 0.5) * 100 // -50ms to +50ms
      }));
      
      // 生成建议
      const recommendations = generateRecommendations({
        pitchAccuracy,
        rhythmAccuracy,
        dynamicsRange,
        vocalStability,
        pitchData,
        rhythmData
      });
      
      resolve({
        fileName: file.name,
        fileSize: file.size,
        duration: Math.floor(Math.random() * 180) + 30, // 30-210 seconds
        format: file.type.split('/')[1].toUpperCase(),
        analysis: {
          pitchAccuracy,
          rhythmAccuracy,
          dynamicsRange,
          vocalStability,
          pitchData,
          rhythmData
        },
        recommendations
      });
    }, 2000); // 2秒模拟分析时间
  });
}

// 生成建议
function generateRecommendations(analysis: AnalysisData): Recommendation[] {
  const recommendations: Recommendation[] = [];
  
  // 音准建议 - 结合基础班第2课"音准训练"内容
  if (analysis.pitchAccuracy < 75) {
    recommendations.push({
      category: 'pitch',
      title: '提高音准准确性',
      description: '建议加强基础班第2课学习的五声音阶练习，特别是"慢速阶梯式音阶"训练，每天练习15分钟，注意使用腹部支撑呼吸法。',
      priority: 'high'
    });
  }
  
  // 节奏建议 - 结合基础班第4课"节奏控制"内容
  if (analysis.rhythmAccuracy < 80) {
    recommendations.push({
      category: 'rhythm',
      title: '加强节奏稳定性',
      description: '参考基础班第4课教授的"节拍细分法"，使用80BPM速度的节拍器，先分手练习再合手，重点关注切分音节奏型的准确性。',
      priority: 'high'
    });
  }
  
  // 音量范围建议 - 结合基础班第6课"动态控制"内容
  if (analysis.dynamicsRange < 25) {
    recommendations.push({
      category: 'dynamics',
      title: '增加音量变化',
      description: '应用基础班第6课学习的"渐强渐弱练习"，从mp到f的动态范围训练，注意保持音色统一，可先从《草原上升起不落的太阳》片段练习。',
      priority: 'medium'
    });
  }
  
  // 声音稳定性建议 - 结合基础班第3课"气息支撑"内容
  if (analysis.vocalStability < 70) {
    recommendations.push({
      category: 'stability',
      title: '提高声音稳定性',
      description: '加强基础班第3课教授的"横膈膜呼吸法"，每天进行5分钟"慢吸慢呼"练习，配合"长音保持训练"，注意气息均匀输出。',
      priority: 'high'
    });
  }
  
  // 共鸣建议 - 结合基础班第5课"共鸣控制"内容
  const resonanceScore = 65 + Math.random() * 30; // 模拟共鸣评分
  if (resonanceScore < 75) {
    recommendations.push({
      category: 'resonance',
      title: '优化共鸣位置',
      description: '练习基础班第5课学习的"面罩共鸣"技巧，通过"哼鸣练习"找到鼻腔共鸣点，注意牙关打开和软腭抬起的感觉。',
      priority: 'medium'
    });
  }
  
  // 确保至少有3条建议
  while (recommendations.length < 3) {
    recommendations.push({
      category: 'general',
      title: '加强歌曲情感表达',
      description: '应用基础班第7课"情感表达"中学习的"歌词解析法"，先朗诵歌词理解情感，再通过声音色彩变化表现歌曲内涵。',
      priority: 'medium'
    });
  }
  
  return recommendations;
}

// 生成对比分析结果
export function compareAnalysisResults(prev: AnalysisResult, current: AnalysisResult): ComparisonResult[] {
  const metrics: Array<{name: string; prevValue: number; currentValue: number; higherIsBetter: boolean}> = [
    { name: '音准准确性', prevValue: prev.analysis.pitchAccuracy, currentValue: current.analysis.pitchAccuracy, higherIsBetter: true },
    { name: '节奏稳定性', prevValue: prev.analysis.rhythmAccuracy, currentValue: current.analysis.rhythmAccuracy, higherIsBetter: true },
    { name: '声音稳定性', prevValue: prev.analysis.vocalStability, currentValue: current.analysis.vocalStability, higherIsBetter: true },
    { name: '动态范围', prevValue: prev.analysis.dynamicsRange, currentValue: current.analysis.dynamicsRange, higherIsBetter: true }
  ];
  
  return metrics.map(metric => {
    const difference = metric.currentValue - metric.prevValue;
    const percentageChange = metric.prevValue > 0 ? (difference / metric.prevValue) * 100 : 0;
    const improvement = metric.higherIsBetter ? difference > 0 : difference < 0;
    
    return {
      metric: metric.name,
      previous: parseFloat(metric.prevValue.toFixed(1)),
      current: parseFloat(metric.currentValue.toFixed(1)),
      difference: parseFloat(difference.toFixed(1)),
      improvement,
      percentageChange: parseFloat(percentageChange.toFixed(1))
    };
  });
}

// 生成进步总结
export function generateImprovementSummary(comparisonResults: ComparisonResult[]): string[] {
  const improvements = comparisonResults.filter(c => c.improvement);
  
  if (improvements.length === 0) {
    return ['两次录音之间未发现明显进步。建议继续练习，特别关注音准和节奏方面。'];
  }
  
  // 按改进幅度排序
  improvements.sort((a, b) => Math.abs(b.percentageChange) - Math.abs(a.percentageChange));
  
  const summary: string[] = [];
  
  // 添加总体进步概述
  summary.push(`恭喜！您在${improvements.length}个方面取得了进步，其中${improvements[0].metric}的提升最为显著(${Math.abs(improvements[0].percentageChange)}%)。`);
  
  // 添加具体进步点
  improvements.forEach(imp => {
    summary.push(`${imp.metric}: 从${imp.previous}提升至${imp.current}(${imp.difference > 0 ? '+' : ''}${imp.difference})`);
  });
  
  return summary;
}

// 类型定义
export type AnalysisResult = {
  fileName: string;
  fileSize: number;
  duration: number;
  format: string;
  analysis: AnalysisData;
  recommendations: Recommendation[];
};

export type AnalysisData = {
  pitchAccuracy: number;
  rhythmAccuracy: number;
  dynamicsRange: number;
  vocalStability: number;
  pitchData: Array<{ time: number; pitch: number; target: number }>;
  rhythmData: Array<{ beat: number; accuracy: number; timingOffset: number }>;
};

export type Recommendation = {
  category: 'pitch' | 'rhythm' | 'dynamics' | 'stability' | 'general';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
};

// 对比分析结果类型
export type ComparisonResult = {
  metric: string;
  previous: number;
  current: number;
  difference: number;
  improvement: boolean;
  percentageChange: number;
};
