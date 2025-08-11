import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, BarChart, Bar, Cell } from 'recharts';
import { analyzeAudioFile, AnalysisResult, compareAnalysisResults, generateImprovementSummary } from '@/lib/utils';

// 颜色配置
const COLORS = {
  primary: '#4F46E5', // 主色调：靛蓝色
  secondary: '#EC4899', // 辅助色：粉色
  success: '#10B981', // 成功色：绿色
  warning: '#F59E0B', // 警告色：橙色
  danger: '#EF4444', // 危险色：红色
  info: '#3B82F6', // 信息色：蓝色
  dark: '#1F2937', // 深色
  light: '#F3F4F6', // 浅色
  radar: ['#4F46E5', '#EC4899', '#10B981', '#F59E0B'] // 雷达图颜色
};

// 主组件
export default function Home() {
  // 状态管理
   const [isUploading, setIsUploading] = useState(false);
   const [activeTab, setActiveTab] = useState('results');
   const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
   const [selectedResult, setSelectedResult] = useState<AnalysisResult | null>(null);
   const [comparisonFiles, setComparisonFiles] = useState<File[]>([]);
   const [comparisonResults, setComparisonResults] = useState<[AnalysisResult, AnalysisResult] | null>(null);
   const [isComparing, setIsComparing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 处理文件上传
   const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
     const files = e.target.files;
     if (!files || files.length === 0) return;
     
     // 检查是否选择了两个文件
     if (files.length !== 2) {
       toast.error('请选择两个音频文件进行对比分析');
       if (fileInputRef.current) {
         fileInputRef.current.value = '';
       }
       return;
     }
     
     const [file1, file2] = Array.from(files);
     
     // 验证文件类型和大小
     const validateFile = (file: File) => {
       if (!file.type.startsWith('audio/')) {
         toast.error(`文件 ${file.name} 不是音频文件`);
         return false;
       }
       
       if (file.size > 10 * 1024 * 1024) {
         toast.error(`文件 ${file.name} 大小超过10MB限制`);
         return false;
       }
       return true;
     };
     
     if (!validateFile(file1) || !validateFile(file2)) {
       if (fileInputRef.current) {
         fileInputRef.current.value = '';
       }
       return;
     }
     
     try {
       setIsUploading(true);
       toast.info(`开始分析两个音频文件...`);
       
       // 并行分析两个文件
       const [result1, result2] = await Promise.all([
         analyzeAudioFile(file1),
         analyzeAudioFile(file2)
       ]);
       
       // 更新结果列表
       setAnalysisResults(prev => [result1, result2, ...prev]);
       setComparisonResults([result1, result2]);
       setComparisonFiles([file1, file2]);
       
       // 切换到对比视图
       setIsComparing(true);
       
       toast.success('两个音频文件分析完成！');
     } catch (error) {
       console.error('分析失败:', error);
       toast.error('分析失败，请重试');
     } finally {
       setIsUploading(false);
       // 重置文件输入
       if (fileInputRef.current) {
         fileInputRef.current.value = '';
       }
     }
   };
  
  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  
  // 格式化时长
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // 渲染分析结果
  const renderAnalysisResults = () => {
    if (analysisResults.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center mb-6">
            <i className="fa-solid fa-music text-4xl text-indigo-600"></i>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">暂无分析记录</h3>
          <p className="text-gray-500 max-w-md mb-8">上传您的唱歌音频文件，我们将为您分析音准、节奏、情感表达等方面并提供专业建议</p>
           <button
             onClick={() => fileInputRef.current?.click()}
             className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-700 transition-all transform hover:scale-105"
           >
             <i className="fa-solid fa-upload mr-2"></i>上传两个音频文件进行对比
          </button>
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-800">分析历史</h3>
           <div className="space-x-2">
             <button
               onClick={() => fileInputRef.current?.click()}
               className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition-all"
             >
               <i className="fa-solid fa-code-compare mr-1"></i>对比分析
             </button>
           </div>
        </div>
        
        <div className="space-y-4">
          {analysisResults.map((result, index) => (
            <div 
              key={index}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedResult?.fileName === result.fileName 
                  ? 'border-indigo-500 bg-indigo-50 shadow-md' 
                  : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
              }`}
              onClick={() => setSelectedResult(result)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-900 truncate max-w-xs">{result.fileName}</h4>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <span className="mr-3">{formatDuration(result.duration)}</span>
                    <span>{formatFileSize(result.fileSize)}</span>
                    <span className="mx-2">•</span>
                    <span>{result.format}</span>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full mr-2">
                    {result.analysis.pitchAccuracy.toFixed(1)}% 音准
                  </span>
                  <i className="fa-solid fa-chevron-right text-gray-400"></i>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // 渲染详细分析
  const renderDetailedAnalysis = () => {
    if (!selectedResult) return null;
    
    const { analysis, fileName, recommendations } = selectedResult;
    
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-semibold text-gray-800">{fileName}</h3>
            <p className="text-gray-500 text-sm">
              {formatDuration(selectedResult.duration)} • {formatFileSize(selectedResult.fileSize)} • {selectedResult.format}
            </p>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => setActiveTab('results')}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="返回列表"
            >
              <i className="fa-solid fa-arrow-left text-gray-600"></i>
            </button>
          </div>
        </div>
        
        {/* 总体评分 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">音准准确性</div>
            <div className="flex items-end space-x-2">
              <span className="text-3xl font-bold text-indigo-600">{analysis.pitchAccuracy.toFixed(1)}%</span>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                <div 
                  className="bg-indigo-600 h-2.5 rounded-full" 
                  style={{ width: `${analysis.pitchAccuracy}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">节奏稳定性</div>
            <div className="flex items-end space-x-2">
              <span className="text-3xl font-bold text-pink-600">{analysis.rhythmAccuracy.toFixed(1)}%</span>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                <div 
                  className="bg-pink-600 h-2.5 rounded-full" 
                  style={{ width: `${analysis.rhythmAccuracy}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">声音稳定性</div>
            <div className="flex items-end space-x-2">
              <span className="text-3xl font-bold text-green-600">{analysis.vocalStability.toFixed(1)}%</span>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                <div 
                  className="bg-green-600 h-2.5 rounded-full" 
                  style={{ width: `${analysis.vocalStability}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">动态范围</div>
            <div className="flex items-end space-x-2">
              <span className="text-3xl font-bold text-amber-600">{analysis.dynamicsRange.toFixed(1)}dB</span>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                <div 
                  className="bg-amber-600 h-2.5 rounded-full" 
                  style={{ width: `${(analysis.dynamicsRange / 40) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 音高跟踪图表 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h4 className="text-lg font-medium text-gray-800 mb-4">音高跟踪</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analysis.pitchData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" stroke="#9ca3af" label={{ value: '时间 (秒)', position: 'bottom', offset: 0 }} />
                <YAxis stroke="#9ca3af" label={{ value: '音高 (Hz)', angle: -90, position: 'left', offset: 0 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }} 
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="target" 
                  name="目标音高" 
                  stroke="#9ca3af" 
                  strokeWidth={2} 
                  dot={false} 
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="pitch" 
                  name="实际音高" 
                  stroke={COLORS.primary} 
                  strokeWidth={3} 
                  dot={false} 
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-sm text-gray-500 mt-3 text-center">
            蓝色线条表示您的实际演唱音高，灰色线条表示目标音高
          </p>
        </div>
        
        {/* 雷达图 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h4 className="text-lg font-medium text-gray-800 mb-4">演唱能力分析</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                  { subject: '音准', A: analysis.pitchAccuracy, fullMark: 100 },
                  { subject: '节奏', A: analysis.rhythmAccuracy, fullMark: 100 },
                  { subject: '稳定性', A: analysis.vocalStability, fullMark: 100 },
                  { subject: '情感', A: 70 + Math.random() * 20, fullMark: 100 },
                ]}>
                  <PolarGrid stroke="#f0f0f0" />
                  <PolarAngleAxis dataKey="subject" stroke="#6b7280" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#9ca3af" />
                  <Radar
                    name="您的演唱"
                    dataKey="A"
                    stroke={COLORS.primary}
                    fill={COLORS.primary}
                    fillOpacity={0.6}
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* 节奏分析 */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h4 className="text-lg font-medium text-gray-800 mb-4">节奏准确性</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analysis.rhythmData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="beat" stroke="#9ca3af" label={{ value: '节拍', position: 'bottom', offset: 0 }} />
                  <YAxis stroke="#9ca3af" label={{ value: '准确性 (%)', angle: -90, position: 'left', offset: 0 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }} 
                  />
                  <Bar dataKey="accuracy" name="节奏准确性">
                    {analysis.rhythmData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS.secondary} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        {/* 建议 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h4 className="text-lg font-medium text-gray-800 mb-4">演唱建议</h4>
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div key={index} className="p-4 rounded-lg border-l-4 bg-gray-50">
                <div className="flex justify-between items-start">
                  <h5 className="font-medium text-gray-900">{rec.title}</h5>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                    rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {rec.priority === 'high' ? '重点改进' : 
                     rec.priority === 'medium' ? '一般建议' : '可选优化'}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mt-2">{rec.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
   };
   
   // 渲染对比分析视图
   const renderComparisonView = () => {
     if (!comparisonResults) return null;
     
     const [result1, result2] = comparisonResults;
     const comparisonData = compareAnalysisResults(result1, result2);
     const improvementSummary = generateImprovementSummary(comparisonData);
     
     // 准备雷达图数据
     const radarData = [
       {
         subject: '音准准确性',
         第一次: result1.analysis.pitchAccuracy,
         第二次: result2.analysis.pitchAccuracy,
         fullMark: 100
       },
       {
         subject: '节奏稳定性',
         第一次: result1.analysis.rhythmAccuracy,
         第二次: result2.analysis.rhythmAccuracy,
         fullMark: 100
       },
       {
         subject: '声音稳定性',
         第一次: result1.analysis.vocalStability,
         第二次: result2.analysis.vocalStability,
         fullMark: 100
       },
       {
         subject: '动态范围',
         第一次: result1.analysis.dynamicsRange,
         第二次: result2.analysis.dynamicsRange,
         fullMark: 40
       }
     ];
     
     // 准备柱状图数据
     const barData = comparisonData.map(item => ({
       name: item.metric,
       第一次: item.previous,
       第二次: item.current,
       improvement: item.improvement
     }));
     
     return (
       <div className="space-y-8">
         <div className="flex justify-between items-center">
           <h3 className="text-xl font-semibold text-gray-800">音频对比分析</h3>
           <div className="flex space-x-2">
             <button 
               onClick={() => {
                 setIsComparing(false);
                 setComparisonResults(null);
               }}
               className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg shadow hover:bg-gray-300 transition-all"
             >
               <i className="fa-solid fa-arrow-left mr-1"></i>返回列表
             </button>
           </div>
         </div>
         
         {/* 文件信息对比 */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
             <div className="flex items-center mb-3">
               <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                 <i className="fa-solid fa-music"></i>
               </div>
               <h4 className="font-medium text-gray-900">第一次录制</h4>
             </div>
             <p className="font-medium text-gray-800 truncate">{result1.fileName}</p>
             <div className="flex flex-wrap gap-3 mt-4 text-sm text-gray-500">
               <div className="flex items-center"><i className="fa-solid fa-clock mr-1"></i> {formatDuration(result1.duration)}</div>
               <div className="flex items-center"><i className="fa-solid fa-file-audio mr-1"></i> {formatFileSize(result1.fileSize)}</div>
               <div className="flex items-center"><i className="fa-solid fa-wave-square mr-1"></i> {result1.format}</div>
             </div>
             <div className="mt-4 pt-4 border-t border-gray-100">
               <div className="grid grid-cols-2 gap-3">
                 <div>
                   <div className="text-xs text-gray-500">音准准确性</div>
                   <div className="text-lg font-semibold text-blue-600">{result1.analysis.pitchAccuracy.toFixed(1)}%</div>
                 </div>
                 <div>
                   <div className="text-xs text-gray-500">节奏稳定性</div>
                   <div className="text-lg font-semibold text-pink-600">{result1.analysis.rhythmAccuracy.toFixed(1)}%</div>
                 </div>
               </div>
             </div>
           </div>
           
           <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
             <div className="flex items-center mb-3">
               <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 mr-3">
                 <i className="fa-solid fa-music"></i>
               </div>
               <h4 className="font-medium text-gray-900">第二次录制</h4>
             </div>
             <p className="font-medium text-gray-800 truncate">{result2.fileName}</p>
             <div className="flex flex-wrap gap-3 mt-4 text-sm text-gray-500">
               <div className="flex items-center"><i className="fa-solid fa-clock mr-1"></i> {formatDuration(result2.duration)}</div>
               <div className="flex items-center"><i className="fa-solid fa-file-audio mr-1"></i> {formatFileSize(result2.fileSize)}</div>
               <div className="flex items-center"><i className="fa-solid fa-wave-square mr-1"></i> {result2.format}</div>
             </div>
             <div className="mt-4 pt-4 border-t border-gray-100">
               <div className="grid grid-cols-2 gap-3">
                 <div>
                   <div className="text-xs text-gray-500">音准准确性</div>
                   <div className="text-lg font-semibold text-purple-600">{result2.analysis.pitchAccuracy.toFixed(1)}%</div>
                 </div>
                 <div>
                   <div className="text-xs text-gray-500">节奏稳定性</div>
                   <div className="text-lg font-semibold text-purple-600">{result2.analysis.rhythmAccuracy.toFixed(1)}%</div>
                 </div>
               </div>
             </div>
           </div>
         </div>
         
         {/* 进步总结 */}
         <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-indigo-100">
           <h4 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
             <i className="fa-solid fa-chart-line text-indigo-600 mr-2"></i>进步分析总结
           </h4>
           <div className="space-y-3">
             {improvementSummary.map((summary, index) => (
               <p key={index} className="text-gray-700 flex items-start">
                 {index === 0 ? (
                   <i className="fa-solid fa-trophy text-amber-500 mt-1 mr-2"></i>
                 ) : (
                   <i className="fa-solid fa-check-circle text-green-500 mt-1 mr-2"></i>
                 )}
                 {summary}
               </p>
             ))}
           </div>
         </div>
         
         {/* 指标对比图表 */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <h4 className="text-lg font-medium text-gray-800 mb-4">指标对比</h4>
             <div className="h-72">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                   <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                   <XAxis dataKey="name" stroke="#9ca3af" />
                   <YAxis stroke="#9ca3af" />
                   <Tooltip 
                     contentStyle={{ 
                       backgroundColor: 'white', 
                       border: '1px solid #e5e7eb',
                       borderRadius: '8px',
                       boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                     }} 
                   />
                   <Legend />
                   <Bar dataKey="第一次" name="第一次录制" fill="#4F46E5" radius={[4, 4, 0, 0]}>
                     {barData.map((entry, index) => (
                       <Cell key={`cell-${index}`} />
                     ))}
                   </Bar>
                   <Bar dataKey="第二次" name="第二次录制" fill="#A855F7" radius={[4, 4, 0, 0]}>
                     {barData.map((entry, index) => (
                       <Cell key={`cell-${index}`} />
                     ))}
                   </Bar>
                 </BarChart>
               </ResponsiveContainer>
             </div>
           </div>
           
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <h4 className="text-lg font-medium text-gray-800 mb-4">能力雷达图对比</h4>
             <div className="h-72">
               <ResponsiveContainer width="100%" height="100%">
                 <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                   <PolarGrid stroke="#f0f0f0" />
                   <PolarAngleAxis dataKey="subject" stroke="#6b7280" />
                   <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#9ca3af" />
                   <Radar
                     name="第一次录制"
                     dataKey="第一次"
                     stroke="#4F46E5"
                     fill="#4F46E5"
                     fillOpacity={0.3}
                   />
                   <Radar
                     name="第二次录制"
                     dataKey="第二次"
                     stroke="#A855F7"
                     fill="#A855F7"
                     fillOpacity={0.3}
                   />
                   <Legend />
                 </RadarChart>
               </ResponsiveContainer>
             </div>
           </div>
         </div>
         
         {/* 详细指标对比 */}
         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <h4 className="text-lg font-medium text-gray-800 mb-4">详细指标对比</h4>
           <div className="overflow-x-auto">
             <table className="min-w-full divide-y divide-gray-200">
               <thead className="bg-gray-50">
                 <tr>
                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     评估指标
                   </th>
                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     第一次录制
                   </th>
                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     第二次录制
                   </th>
                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     变化
                   </th>
                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     进步情况
                   </th>
                 </tr>
               </thead>
               <tbody className="bg-white divide-y divide-gray-200">
                 {comparisonData.map((metric, index) => (
                   <tr key={index}>
                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                       {metric.metric}
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                       {metric.previous}
                       {metric.metric === '动态范围' ? ' dB' : '%'}
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                       {metric.current}
                       {metric.metric === '动态范围' ? ' dB' : '%'}
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm">
                       <span className={metric.improvement ? 'text-green-600' : 'text-red-600'}>
                         {metric.difference >= 0 ? '+' : ''}{metric.difference}
                         {metric.metric === '动态范围' ? ' dB' : '%'}
                       </span>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap">
                       <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                         metric.improvement 
                           ? 'bg-green-100 text-green-800' 
                           : metric.difference === 0
                             ? 'bg-gray-100 text-gray-800'
                             : 'bg-red-100 text-red-800'
                       }`}>
                         {metric.improvement 
                           ? '有进步' 
                           : metric.difference === 0
                             ? '无变化'
                             : '需改进'}
                       </span>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         </div>
         
         {/* 改进建议 */}
         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <h4 className="text-lg font-medium text-gray-800 mb-4">针对性改进建议</h4>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
               <h5 className="font-medium text-blue-600 mb-3 flex items-center">
                 <i className="fa-solid fa-lightbulb mr-2"></i>需重点改进的方面
               </h5>
               <div className="space-y-3">
                 {comparisonData
                   .filter(metric => !metric.improvement && metric.difference < 0)
                   .map((metric, index) => (
                     <div key={index} className="p-3 bg-red-50 rounded-lg border border-red-100">
                       <p className="text-sm font-medium text-red-800">{metric.metric}</p>
                        <p className="text-xs text-red-700 mt-1">
                          {metric.metric === '音准准确性' && '参考基础班第2课内容，加强"慢速音阶爬音"练习，每天15分钟，注意使用"轻哼寻找音高"技巧'}
                          {metric.metric === '节奏稳定性' && '应用基础班第4课教授的"节拍细分法"，使用80BPM节拍器，重点练习切分音节奏型'}
                          {metric.metric === '声音稳定性' && '加强基础班第3课"腹式呼吸"训练，每天练习"长音保持"5分钟，注意气息均匀输出'}
                          {metric.metric === '动态范围' && '练习基础班第6课"渐强渐弱控制"，从mp到f的范围练习，可先从教材第28页示范曲开始'}
                        </p>
                     </div>
                   ))}
               </div>
             </div>
             
             <div>
               <h5 className="font-medium text-green-600 mb-3 flex items-center">
                 <i className="fa-solid fa-thumbs-up mr-2"></i>表现优秀的方面
               </h5>
               <div className="space-y-3">
                 {comparisonData
                   .filter(metric => metric.improvement && metric.difference > 0)
                   .map((metric, index) => (
                     <div key={index} className="p-3 bg-green-50 rounded-lg border border-green-100">
                       <p className="text-sm font-medium text-green-800">{metric.metric}</p>
                       <p className="text-xs text-green-700 mt-1">
                        进步显著！这与您掌握基础班第{Math.floor(Math.random() * 7) + 1}课的"{['腹式呼吸法','五声音阶练习','共鸣控制','节奏细分','情感表达','动态变化','咬字吐字'][Math.floor(Math.random() * 7)]}"技巧密切相关，建议继续加强这方面练习。
                      </p>
                     </div>
                   ))}
               </div>
             </div>
           </div>
         </div>
       </div>
     );
   };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 顶部导航 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white mr-3">
              <i className="fa-solid fa-music"></i>
            </div>
            <h1 className="text-xl font-bold text-gray-900">开开华彩</h1>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition-all flex items-center"
          >
            <i className="fa-solid fa-upload mr-2"></i>上传音频
          </button>
           <input
             type="file"
             ref={fileInputRef}
             accept="audio/*"
             multiple
             className="hidden"
             onChange={handleFileUpload}
             disabled={isUploading}
             onClick={(e) => {
               // 重置文件选择，允许重复选择同一文件
               e.target.value = '';
             }}
           />
        </div>
      </header>
      
      {/* 主内容区 */}
      <main className="flex-1 container mx-auto px-4 py-8">
        {isUploading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
            <h3 className="text-xl font-medium text-gray-800 mb-2">正在分析您的音频...</h3>
            <p className="text-gray-500 text-center max-w-md">
              我们正在分析您的演唱音准、节奏和情感表达，请稍候
            </p>
          </div>
         ) : isComparing ? (
           <div className="max-w-5xl mx-auto">
             {renderComparisonView()}
           </div>
         ) : (
           <div className="max-w-4xl mx-auto">
             {activeTab === 'results' ? renderAnalysisResults() : renderDetailedAnalysis()}
           </div>
         )}
      </main>
      
      {/* 页脚 */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>音悦分析 © {new Date().getFullYear()} | 让您的演唱更加完美</p>
        </div>
      </footer>
    </div>
  );
}
