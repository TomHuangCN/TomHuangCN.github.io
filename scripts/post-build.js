#!/usr/bin/env node
/* eslint-env node */

import { readdirSync, statSync } from "fs";
import { join, extname } from "path";

const CDN_BASE =
  "https://cdn.jsdelivr.net.cn/gh/TomHuangCN/TomHuangCN.github.io@gh-pages";
const DIST_DIR = "./dist";

// 替换函数 - 只替换以 /assets/ 开头的绝对路径
// function replaceAssetPaths(content) {
//   // 使用正则表达式精确匹配以 /assets/ 开头的路径
//   // 避免重复替换和错误的路径生成
//   return content.replace(/(["'])\/assets\//g, `$1${CDN_BASE}/assets/`);
// }

// 处理单个文件
function processFile(filePath) {
  try {
    // const content = readFileSync(filePath, "utf8");
    // const newContent = replaceAssetPaths(content);
    // if (content !== newContent) {
    //   writeFileSync(filePath, newContent, "utf8");
    //   console.log(`✅ 已处理: ${filePath}`);
    // }
    //  注释掉 CDN 替换逻辑，保留原内容直接输出
    // 你可以取消注释上面三行以恢复 CDN 替换能力
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
