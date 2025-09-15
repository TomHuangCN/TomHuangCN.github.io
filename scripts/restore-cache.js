#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

// 配置
const CONFIG = {
  assetsDir: path.join(projectRoot, "public", "assets"),
  srcDir: path.join(projectRoot, "src"),
  cacheMapFile: path.join(projectRoot, "cache.map"),
};

/**
 * 更新文件中的资源引用（恢复原始引用）
 * @param {string} filePath 文件路径
 * @param {Map} fileMap 文件映射
 */
function restoreFileReferences(filePath, fileMap) {
  let content = fs.readFileSync(filePath, "utf8");
  let modified = false;

  // 恢复所有映射的文件引用
  for (const [originalPath, newPath] of fileMap) {
    // 匹配各种可能的引用格式
    const patterns = [
      new RegExp(
        `"/assets/${path.basename(newPath).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`,
        "g"
      ),
      new RegExp(
        `'/assets/${path.basename(newPath).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}'`,
        "g"
      ),
      new RegExp(
        `"/assets/${path.basename(newPath).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`,
        "g"
      ),
      new RegExp(
        `'/assets/${path.basename(newPath).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}'`,
        "g"
      ),
    ];

    for (const pattern of patterns) {
      if (pattern.test(content)) {
        content = content.replace(pattern, match => {
          return match.replace(
            path.basename(newPath),
            path.basename(originalPath)
          );
        });
        modified = true;
      }
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`✓ 恢复文件引用: ${path.relative(projectRoot, filePath)}`);
  }
}

/**
 * 递归恢复目录中所有文件的引用
 * @param {string} dir 目录路径
 * @param {Map} fileMap 文件映射
 */
function restoreDirectoryReferences(dir, fileMap) {
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      restoreDirectoryReferences(fullPath, fileMap);
    } else if (
      stat.isFile() &&
      (item.endsWith(".ts") ||
        item.endsWith(".tsx") ||
        item.endsWith(".js") ||
        item.endsWith(".jsx"))
    ) {
      restoreFileReferences(fullPath, fileMap);
    }
  }
}

/**
 * 主函数
 */
function main() {
  console.log("🔄 开始恢复缓存破坏...\n");

  // 检查缓存映射文件是否存在
  if (!fs.existsSync(CONFIG.cacheMapFile)) {
    console.log("❌ 未找到 cache.map 文件");
    console.log("   请确保已经运行过缓存破坏脚本");
    process.exit(1);
  }

  // 读取缓存映射
  let mapData;
  try {
    const mapContent = fs.readFileSync(CONFIG.cacheMapFile, "utf8");
    mapData = JSON.parse(mapContent);
  } catch (error) {
    console.log("❌ 无法解析 cache.map 文件");
    console.log(`   错误: ${error.message}`);
    process.exit(1);
  }

  const fileMap = new Map(Object.entries(mapData.mappings));
  console.log(`📁 找到 ${fileMap.size} 个文件映射\n`);

  if (fileMap.size === 0) {
    console.log("❌ 没有找到需要恢复的文件映射");
    return;
  }

  console.log("📝 恢复文件:");

  // 恢复文件
  for (const [originalPath, newPath] of fileMap) {
    if (fs.existsSync(newPath)) {
      fs.renameSync(newPath, originalPath);
      console.log(
        `  ${path.basename(newPath)} → ${path.basename(originalPath)}`
      );
    } else {
      console.log(`  ⚠️  文件不存在: ${path.relative(projectRoot, newPath)}`);
    }
  }

  console.log("\n📝 恢复源代码引用:");

  // 恢复源代码中的引用
  restoreDirectoryReferences(CONFIG.srcDir, fileMap);

  // 删除缓存映射文件
  fs.unlinkSync(CONFIG.cacheMapFile);
  console.log(
    `✓ 删除缓存映射文件: ${path.relative(projectRoot, CONFIG.cacheMapFile)}`
  );

  console.log("\n✅ 缓存破坏恢复完成!");
  console.log(`📊 恢复统计:`);
  console.log(`   - 恢复文件: ${fileMap.size} 个`);
  console.log(`   - 恢复引用: src 目录中的所有相关文件`);
}

// 运行主函数
main();
