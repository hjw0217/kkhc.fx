# 开开华彩声乐分析工具

一个用于声乐学习者的音频分析和对比工具，帮助用户通过可视化方式了解自己的演唱表现并跟踪进步情况。

## 功能特点

- 上传并分析两个音频文件
- 对比两次演唱的音准、节奏、声音稳定性等关键指标
- 生成详细的进步分析报告
- 结合开开华彩声乐基础班教学内容提供针对性建议
- 直观的数据可视化展示

## 安装步骤

1. 克隆本仓库
```bash
git clone https://github.com/yourusername/kaikai-vocal-analysis.git
cd kaikai-vocal-analysis
```

2. 安装依赖
```bash
pnpm install
```

3. 启动开发服务器
```bash
pnpm dev
```

4. 在浏览器中访问 http://localhost:3000

## 使用方法

1. 点击"上传音频"按钮，同时选择两个音频文件
2. 等待系统分析完成
3. 查看详细的对比分析报告，包括:
   - 进步分析总结
   - 指标对比图表
   - 详细指标对比表格
   - 针对性改进建议

## 技术栈

- React 18+
- TypeScript
- Tailwind CSS
- Recharts (数据可视化)
- Vite (构建工具)

## 项目结构

```
src/
├── components/   - UI组件
├── contexts/     - React上下文
├── hooks/        - 自定义Hooks
├── lib/          - 工具函数和业务逻辑
├── pages/        - 页面组件
├── App.tsx       - 应用入口组件
└── main.tsx      - 渲染入口
```

## 许可证

本项目采用MIT许可证。