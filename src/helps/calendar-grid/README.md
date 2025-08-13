# 日历网格生成器 - 字体加载状态功能

## 功能概述

日历网格生成器现在支持实时显示字体的加载状态，让用户能够清楚地知道哪些字体已经可以使用，哪些还在加载中。

## 字体文件结构

字体文件直接放在 `public/fonts/` 目录下：
```
public/fonts/
├── MaShanZheng-Regular.ttf      # 马善政手写体
├── Xiaolai-Regular.ttf          # 小赖手写体
├── VonwaonBitmap-12px.ttf       # Vonwaon点阵体
└── 千图小兔体.ttf               # 千图小兔体
```

## 主要特性

### 1. 字体加载状态显示
- **加载中**: 显示旋转的加载动画
- **已加载**: 显示绿色勾号 ✓
- **未加载**: 显示"未加载"状态

### 2. 智能字体选择器
- 替换了原生的 `<select>` 元素
- 自定义下拉菜单，支持状态图标显示
- 未加载的字体不可选择（显示为禁用状态）
- 支持点击外部关闭下拉菜单

### 3. 实时状态监控
- 自动监控字体加载进度
- 500ms 间隔检查字体状态
- 支持手动刷新状态
- 使用观察者模式通知状态变化

## 组件结构

### FontSelector 组件
- 自定义字体选择器
- 支持字体状态显示
- 响应式设计，适配不同屏幕尺寸

### FontStatusManager 类
- 单例模式管理字体状态
- 自动监控字体加载
- 提供状态订阅机制

### FontStatusTest 组件
- 测试组件，显示所有字体的当前状态
- 支持手动刷新状态
- 可折叠显示，不影响主要界面

## 使用方法

### 1. 基本使用
```tsx
import { CalendarGrid } from './helps/calendar-grid';

function App() {
  return <CalendarGrid />;
}
```

### 2. 字体状态管理
```tsx
import { fontStatusManager } from './helps/calendar-grid';

// 订阅字体状态变化
const unsubscribe = fontStatusManager.subscribe((fonts) => {
  console.log('字体状态更新:', fonts);
});

// 手动刷新状态
fontStatusManager.refreshStatus();

// 获取当前状态
const currentStatus = fontStatusManager.getFontStatus();
```

### 3. 自定义字体选择器
```tsx
import { FontSelector } from './helps/calendar-grid';

function CustomFontSelector() {
  const [selectedFont, setSelectedFont] = useState('system-ui');
  
  return (
    <FontSelector
      selectedFont={selectedFont}
      onFontSelect={setSelectedFont}
    />
  );
}
```

## 字体配置

字体配置在 `constants.ts` 文件中定义：

```tsx
export const fontOptions: FontOption[] = [
  {
    name: "系统默认",
    value: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    displayName: "系统默认",
    isLoading: false,
    isLoaded: true,
  },
  {
    name: "Ma Shan Zheng",
    value: "'Ma Shan Zheng', cursive",
    displayName: "马善政手写体",
    isLoading: true,
    isLoaded: false,
  },
  // ... 更多字体
];
```

## 状态管理

### 字体状态类型
```tsx
interface FontOption {
  name: string;        // 字体名称
  value: string;       // CSS 字体值
  displayName: string; // 显示名称
  isLoading?: boolean; // 是否正在加载
  isLoaded?: boolean;  // 是否已加载
}
```

### 状态转换
1. **初始状态**: `isLoading: true, isLoaded: false`
2. **加载中**: `isLoading: true, isLoaded: false`
3. **加载完成**: `isLoading: false, isLoaded: true`
4. **加载失败**: `isLoading: false, isLoaded: false`

## 技术实现

### 1. 字体检测
使用 `font-loader.ts` 中的 `isFontLoaded()` 函数检测字体是否已加载到缓存中。

### 2. 状态监控
- 使用 `setInterval` 定期检查字体状态
- 监听 `DOMContentLoaded` 和 `load` 事件
- 自动停止已完成加载的监控

### 3. 响应式更新
- 使用 React 的 `useState` 和 `useEffect` 管理状态
- 观察者模式通知状态变化
- 支持组件卸载时的清理

## 样式定制

### 加载动画
```css
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

### 状态颜色
- **加载中**: 蓝色 (#1890ff)
- **已加载**: 绿色 (#52c41a)
- **未加载**: 红色 (#ff4d4f)
- **禁用状态**: 灰色 (#999)

## 注意事项

1. **字体预加载**: 确保在应用启动时调用 `autoPreloadFonts()`
2. **状态同步**: 字体状态管理器会自动同步所有组件的状态
3. **性能优化**: 监控会在所有字体加载完成后自动停止
4. **错误处理**: 加载失败的字体会显示为"未加载"状态

## 未来改进

1. **字体加载进度条**: 显示具体的加载进度百分比
2. **字体预览**: 在选择器中预览字体效果
3. **字体分类**: 按字体类型或语言分类
4. **离线支持**: 支持离线字体的状态管理
