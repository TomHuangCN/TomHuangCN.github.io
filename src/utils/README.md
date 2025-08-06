# SVG 工具函数

这个文件包含了所有SVG相关的操作函数，提供了完整的SVG处理能力。

## 主要功能

### 1. `createSvgFromElement(element, options)`
将HTML元素转换为SVG字符串

**参数：**
- `element`: HTMLElement - 要转换的HTML元素
- `options`: SvgOptions - 配置选项
  - `width?`: number - 宽度
  - `height?`: number - 高度
  - `scale?`: number - 缩放比例（默认1）
  - `backgroundColor?`: string - 背景色
  - `customStyles?`: string - 自定义CSS样式

**示例：**
```typescript
import { createSvgFromElement } from './svg';

const element = document.getElementById('my-element');
const svgString = createSvgFromElement(element, {
  scale: 2,
  backgroundColor: '#ffffff',
  customStyles: `
    body { font-family: Arial, sans-serif; }
    .highlight { color: red; }
  `
});
```

### 2. `svgToDataUrl(svgString)`
将SVG字符串转换为Data URL

**示例：**
```typescript
import { svgToDataUrl } from './svg';

const dataUrl = svgToDataUrl(svgString);
// 返回: "data:image/svg+xml;base64,..."
```

### 3. `svgToBlob(svgString)`
将SVG字符串转换为Blob对象

**示例：**
```typescript
import { svgToBlob } from './svg';

const blob = svgToBlob(svgString);
```

### 4. `downloadSvg(svgString, filename)`
下载SVG文件

**示例：**
```typescript
import { downloadSvg } from './svg';

downloadSvg(svgString, 'my-image.svg');
```

### 5. `downloadMultipleSvg(svgStringList, filenameList)`
批量下载多个SVG文件

**示例：**
```typescript
import { downloadMultipleSvg } from './svg';

downloadMultipleSvg(
  [svg1, svg2, svg3],
  ['image1.svg', 'image2.svg', 'image3.svg']
);
```

### 6. `svgToPng(svgString, options)`
将SVG转换为PNG（通过Canvas）

**参数：**
- `svgString`: string - SVG字符串
- `options`: object - 配置选项
  - `width?`: number - 宽度
  - `height?`: number - 高度
  - `backgroundColor?`: string - 背景色
  - `quality?`: number - 图片质量（0-1）

**示例：**
```typescript
import { svgToPng } from './svg';

const pngDataUrl = await svgToPng(svgString, {
  backgroundColor: '#ffffff',
  quality: 0.9
});
```

### 7. `getSvgDimensions(svgString)`
获取SVG的尺寸信息

**示例：**
```typescript
import { getSvgDimensions } from './svg';

const dimensions = getSvgDimensions(svgString);
// 返回: { width: 100, height: 200 } 或 null
```

### 8. `isValidSvg(svgString)`
验证SVG字符串是否有效

**示例：**
```typescript
import { isValidSvg } from './svg';

const isValid = isValidSvg(svgString);
// 返回: boolean
```

## 使用场景

1. **HTML转SVG**: 将网页元素转换为矢量图形
2. **批量导出**: 批量生成和下载SVG文件
3. **格式转换**: SVG转PNG、Data URL等
4. **文件下载**: 直接下载SVG文件
5. **验证检查**: 验证SVG格式的有效性

## 注意事项

- 所有函数都支持TypeScript类型检查
- SVG转换会保持原始元素的样式和布局
- 可以通过`customStyles`参数添加额外的CSS样式
- 支持透明背景和自定义背景色
- 批量下载会有100ms的延迟以避免浏览器阻塞 