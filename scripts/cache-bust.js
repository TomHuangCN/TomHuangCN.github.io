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
 * 更新文件中的资源引用
 * @param {string} filePath 文件路径
 * @param {Map} fileMap 文件映射
 */
function updateFileReferences(filePath, fileMap) {
  let content = fs.readFileSync(filePath, "utf8");
  let modified = false;

  // 更新所有映射的文件引用
  for (const [originalPath, newPath] of fileMap) {
    // 匹配各种可能的引用格式
    const patterns = [
      new RegExp(
        `"/assets/${path.basename(originalPath).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`,
        "g"
      ),
      new RegExp(
        `'/assets/${path.basename(originalPath).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}'`,
        "g"
      ),
      new RegExp(
        `"/assets/${path.basename(originalPath).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`,
        "g"
      ),
      new RegExp(
        `'/assets/${path.basename(originalPath).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}'`,
        "g"
      ),
    ];

    for (const pattern of patterns) {
      if (pattern.test(content)) {
        content = content.replace(pattern, match => {
          return match.replace(
            path.basename(originalPath),
            path.basename(newPath)
          );
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
    } else if (
      stat.isFile() &&
      (item.endsWith(".ts") ||
        item.endsWith(".tsx") ||
        item.endsWith(".js") ||
        item.endsWith(".jsx"))
    ) {
      updateFileReferences(fullPath, fileMap);
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

  // 重命名文件
  console.log("📝 重命名文件:");
  for (const file of files) {
    const newPath = generateNewFileName(file);

    fs.renameSync(file, newPath);
    fileMap.set(file, newPath);

    console.log(`  ${path.basename(file)} → ${path.basename(newPath)}`);
  }

  console.log("\n📝 更新源代码引用:");

  // 更新源代码中的引用
  updateDirectoryReferences(CONFIG.srcDir, fileMap);

  // 保存缓存映射
  saveCacheMap(fileMap);

  console.log("\n✅ 缓存破坏处理完成!");
  console.log(`📊 处理统计:`);
  console.log(`   - 重命名文件: ${files.length} 个`);
  console.log(
    `   - 映射文件: ${path.relative(projectRoot, CONFIG.cacheMapFile)}`
  );
  console.log(
    `\n💡 提示: 使用 'node scripts/restore-cache.js' 可以恢复原始文件名`
  );
}

// 运行主函数
main();
