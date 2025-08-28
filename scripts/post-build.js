#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join, extname } from "path";

const CDN_BASE =
  "https://cdn.jsdelivr.net/gh/TomHuangCN/TomHuangCN.github.io@gh-pages";
const DIST_DIR = "./dist";

// 需要替换的资源路径模式
const ASSET_PATTERNS = [/"\/assets\//g, /'\/assets\//g, /\/assets\//g];

// 替换函数
function replaceAssetPaths(content) {
  let result = content;
  ASSET_PATTERNS.forEach(pattern => {
    result = result.replace(pattern, `"${CDN_BASE}/assets/`);
  });
  return result;
}

// 处理单个文件
function processFile(filePath) {
  try {
    const content = readFileSync(filePath, "utf8");
    const newContent = replaceAssetPaths(content);

    if (content !== newContent) {
      writeFileSync(filePath, newContent, "utf8");
      console.log(`✅ 已处理: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ 处理文件失败 ${filePath}:`, error.message);
  }
}

// 递归处理目录
function processDirectory(dirPath) {
  try {
    const items = readdirSync(dirPath);

    items.forEach(item => {
      const fullPath = join(dirPath, item);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        processDirectory(fullPath);
      } else if (stat.isFile()) {
        const ext = extname(item);
        // 只处理 JavaScript、CSS 和 HTML 文件
        if ([".js", ".css", ".html"].includes(ext)) {
          processFile(fullPath);
        }
      }
    });
  } catch (error) {
    console.error(`❌ 处理目录失败 ${dirPath}:`, error.message);
  }
}

// 主函数
function main() {
  console.log("🚀 开始构建后处理...");
  console.log(`📡 CDN 基础路径: ${CDN_BASE}`);

  if (!statSync(DIST_DIR).isDirectory()) {
    console.error(`❌ 构建目录不存在: ${DIST_DIR}`);
    console.log("💡 请先运行 pnpm build");
    process.exit(1);
  }

  processDirectory(DIST_DIR);
  console.log("🎉 构建后处理完成！");
}

main();
