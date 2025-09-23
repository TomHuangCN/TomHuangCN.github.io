#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

// 配置
const CONFIG = {
  assetsDir: path.join(projectRoot, "public", "assets"),
  srcDir: path.join(projectRoot, "src"),
  cacheMapFile: path.join(projectRoot, "cache.map"),
  randomLength: 8, // 随机数长度，避免文件名过长
  supportedExtensions: [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".svg",
    ".ttf",
    ".woff",
    ".woff2",
    ".otf",
  ],
};

/**
 * 生成短随机字符串
 * @param {number} length 长度
 * @returns {string} 随机字符串
 */
function generateRandomString(length = CONFIG.randomLength) {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString("hex")
    .slice(0, length);
}

/**
 * 递归获取目录下所有文件
 * @param {string} dir 目录路径
 * @returns {string[]} 文件路径数组
 */
function getAllFiles(dir) {
  const files = [];

  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);

    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (stat.isFile()) {
        const ext = path.extname(item).toLowerCase();
        if (CONFIG.supportedExtensions.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  }

  traverse(dir);
  return files;
}

/**
 * 生成新的文件名
 * @param {string} originalPath 原始文件路径
 * @returns {string} 新文件路径
 */
function generateNewFileName(originalPath) {
  const dir = path.dirname(originalPath);
  const ext = path.extname(originalPath);
  const nameWithoutExt = path.basename(originalPath, ext);
  const randomStr = generateRandomString();

  return path.join(dir, `${nameWithoutExt}.${randomStr}${ext}`);
}

/**
 * 专门处理字体文件的路径更新
 * @param {string} filePath 文件路径
 * @param {Map} fontMap 字体文件映射
 */
function updateFontReferences(filePath, fontMap) {
  let content = fs.readFileSync(filePath, "utf8");
  let modified = false;

  for (const [originalPath, newPath] of fontMap) {
    const originalFileName = path.basename(originalPath);
    const newFileName = path.basename(newPath);
    
    if (originalFileName === newFileName) continue;

    // 字体文件的特殊匹配模式
    const fontPatterns = [
      // CSS @font-face 中的 src 属性
      new RegExp(
        `(src:\\s*url\\(['"]?)/assets/fonts/${originalFileName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(['"]?\\))`,
        "g"
      ),
      // JavaScript 中的字体路径字符串
      new RegExp(
        `(['"]/assets/fonts/)${originalFileName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(['"])`,
        "g"
      ),
      // 字体映射对象中的路径
      new RegExp(
        `(['"]/assets/fonts/)${originalFileName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(['"])`,
        "g"
      )
    ];

    for (const pattern of fontPatterns) {
      if (pattern.test(content)) {
        content = content.replace(pattern, (match, prefix, suffix) => {
          return `${prefix}${newFileName}${suffix}`;
        });
        modified = true;
      }
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`✓ 更新字体引用: ${path.relative(projectRoot, filePath)}`);
  }
}

/**
 * 更新文件中的资源引用
 * @param {string} filePath 文件路径
 * @param {Map} fileMap 文件映射
 */
function updateFileReferences(filePath, fileMap) {
  let content = fs.readFileSync(filePath, "utf8");
  let modified = false;

  // 更新所有映射的文件引用
  for (const [originalPath, newPath] of fileMap) {
    const originalFileName = path.basename(originalPath);
    const newFileName = path.basename(newPath);
    
    // 跳过没有变化的文件
    if (originalFileName === newFileName) continue;

    // 获取文件扩展名，用于特殊处理
    const ext = path.extname(originalPath).toLowerCase();
    const isFontFile = ['.ttf', '.woff', '.woff2', '.otf'].includes(ext);

    // 构建更全面的匹配模式
    const patterns = [];

    if (isFontFile) {
      // 字体文件的特殊处理 - 支持更多引用格式
      patterns.push(
        // CSS @font-face 中的 url() 引用
        new RegExp(
          `url\\(['"]?/assets/fonts/${originalFileName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}['"]?\\)`,
          "g"
        ),
        // JavaScript/TypeScript 中的字符串引用
        new RegExp(
          `['"]/assets/fonts/${originalFileName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}['"]`,
          "g"
        ),
        // 相对路径引用
        new RegExp(
          `['"]\\./assets/fonts/${originalFileName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}['"]`,
          "g"
        ),
        // 不带引号的引用
        new RegExp(
          `/assets/fonts/${originalFileName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`,
          "g"
        )
      );
    } else {
      // 其他资源文件的处理
      patterns.push(
        new RegExp(
          `['"]/assets/${originalFileName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}['"]`,
          "g"
        ),
        new RegExp(
          `['"]\\./assets/${originalFileName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}['"]`,
          "g"
        )
      );
    }

    // 应用所有匹配模式
    for (const pattern of patterns) {
      if (pattern.test(content)) {
        content = content.replace(pattern, match => {
          // 保持原有的引号格式
          if (match.includes("url(")) {
            // CSS url() 格式
            return match.replace(originalFileName, newFileName);
          } else if (match.startsWith('"') || match.startsWith("'")) {
            // 带引号的字符串
            return match.replace(originalFileName, newFileName);
          } else {
            // 不带引号的路径
            return match.replace(originalFileName, newFileName);
          }
        });
        modified = true;
      }
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`✓ 更新文件引用: ${path.relative(projectRoot, filePath)}`);
  }
}

/**
 * 递归更新目录中字体文件的引用
 * @param {string} dir 目录路径
 * @param {Map} fontMap 字体文件映射
 */
function updateFontReferencesInDirectory(dir, fontMap) {
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      updateFontReferencesInDirectory(fullPath, fontMap);
    } else if (stat.isFile()) {
      const ext = path.extname(item).toLowerCase();
      // 字体引用可能出现在这些文件中
      const supportedExtensions = [
        ".ts", ".tsx", ".js", ".jsx", ".css", ".scss", ".sass", ".less"
      ];
      
      if (supportedExtensions.includes(ext)) {
        updateFontReferences(fullPath, fontMap);
      }
    }
  }
}

/**
 * 递归更新目录中所有文件的引用
 * @param {string} dir 目录路径
 * @param {Map} fileMap 文件映射
 */
function updateDirectoryReferences(dir, fileMap) {
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      updateDirectoryReferences(fullPath, fileMap);
    } else if (stat.isFile()) {
      const ext = path.extname(item).toLowerCase();
      // 支持更多文件类型，包括 CSS 文件
      const supportedExtensions = [
        ".ts", ".tsx", ".js", ".jsx", ".css", ".scss", ".sass", ".less"
      ];
      
      if (supportedExtensions.includes(ext)) {
        updateFileReferences(fullPath, fileMap);
      }
    }
  }
}

/**
 * 保存缓存映射文件
 * @param {Map} fileMap 文件映射
 */
function saveCacheMap(fileMap) {
  const mapData = {
    timestamp: new Date().toISOString(),
    mappings: Object.fromEntries(fileMap),
  };

  fs.writeFileSync(
    CONFIG.cacheMapFile,
    JSON.stringify(mapData, null, 2),
    "utf8"
  );
  console.log(
    `✓ 生成缓存映射文件: ${path.relative(projectRoot, CONFIG.cacheMapFile)}`
  );
}

/**
 * 主函数
 */
function main() {
  console.log("🚀 开始缓存破坏处理...\n");

  // 检查是否存在旧的缓存映射
  if (fs.existsSync(CONFIG.cacheMapFile)) {
    console.log("⚠️  检测到已存在的 cache.map 文件");
    console.log("   请先运行恢复脚本或手动删除 cache.map 文件");
    process.exit(1);
  }

  // 获取所有需要处理的文件
  const files = getAllFiles(CONFIG.assetsDir);
  console.log(`📁 找到 ${files.length} 个静态资源文件\n`);

  if (files.length === 0) {
    console.log("❌ 没有找到需要处理的文件");
    return;
  }

  const fileMap = new Map();
  const fontMap = new Map();

  // 重命名文件
  console.log("📝 重命名文件:");
  for (const file of files) {
    const newPath = generateNewFileName(file);

    fs.renameSync(file, newPath);
    fileMap.set(file, newPath);

    // 分离字体文件用于特殊处理
    const ext = path.extname(file).toLowerCase();
    if (['.ttf', '.woff', '.woff2', '.otf'].includes(ext)) {
      fontMap.set(file, newPath);
    }

    console.log(`  ${path.basename(file)} → ${path.basename(newPath)}`);
  }

  console.log("\n📝 更新源代码引用:");

  // 更新源代码中的引用
  updateDirectoryReferences(CONFIG.srcDir, fileMap);
  
  // 更新 public 目录中的 CSS 文件引用
  const publicDir = path.join(projectRoot, "public");
  if (fs.existsSync(publicDir)) {
    console.log("📝 更新 public 目录中的文件引用:");
    updateDirectoryReferences(publicDir, fileMap);
  }

  // 专门处理字体文件引用
  if (fontMap.size > 0) {
    console.log("\n📝 更新字体文件引用:");
    
    // 处理 src 目录中的字体引用
    updateFontReferencesInDirectory(CONFIG.srcDir, fontMap);
    
    // 处理 public 目录中的字体引用
    if (fs.existsSync(publicDir)) {
      updateFontReferencesInDirectory(publicDir, fontMap);
    }
  }

  // 保存缓存映射
  saveCacheMap(fileMap);

  console.log("\n✅ 缓存破坏处理完成!");
  console.log(`📊 处理统计:`);
  console.log(`   - 重命名文件: ${files.length} 个`);
  console.log(`   - 字体文件: ${fontMap.size} 个`);
  console.log(
    `   - 映射文件: ${path.relative(projectRoot, CONFIG.cacheMapFile)}`
  );
  console.log(
    `\n💡 提示: 使用 'node scripts/restore-cache.js' 可以恢复原始文件名`
  );
}

// 运行主函数
main();
