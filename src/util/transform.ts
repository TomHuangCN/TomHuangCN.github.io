/**
 * 对一张图片进行透视变换
 * @param srcCanvas 源canvas（已绘制好图片）
 * @param srcPoints 源点坐标，格式为[[x0,y0],[x1,y1],[x2,y2],[x3,y3]]，顺序为左上、右上、右下、左下
 * @param dstPoints 目标点坐标，格式同上
 * @param dstWidth 目标画布宽度
 * @param dstHeight 目标画布高度
 * @returns 变换后的canvas
 */
export function perspectiveTransform(
  srcCanvas: HTMLCanvasElement,
  srcPoints: [number, number][],
  dstPoints: [number, number][],
  dstWidth: number,
  dstHeight: number
): HTMLCanvasElement {
  // 计算单应性矩阵
  function getHomography(src: [number, number][], dst: [number, number][]) {
    // 参考: https://github.com/epistemex/transformation-matrix/blob/master/src/homography.js
    const A: number[][] = [];
    for (let i = 0; i < 4; i++) {
      const [x, y] = src[i];
      const [u, v] = dst[i];
      A.push([-x, -y, -1, 0, 0, 0, x * u, y * u, u]);
      A.push([0, 0, 0, -x, -y, -1, x * v, y * v, v]);
    }
    // 求解A * h = 0，h为9维向量
    // 用SVD求解最小特征值对应的特征向量
    // 这里只做简单实现，直接用mathjs库的SVD（如未引入mathjs，可用最小二乘法近似）
    // 这里用高斯消元法求解
    function gaussianElimination(a: number[][], n: number) {
      for (let i = 0; i < n; i++) {
        // 找主元
        let maxRow = i;
        for (let k = i + 1; k < n; k++) {
          if (Math.abs(a[k][i]) > Math.abs(a[maxRow][i])) maxRow = k;
        }
        // 交换
        [a[i], a[maxRow]] = [a[maxRow], a[i]];
        // 消元
        for (let k = i + 1; k < n; k++) {
          const c = a[k][i] / a[i][i];
          for (let j = i; j < n + 1; j++) {
            a[k][j] -= c * a[i][j];
          }
        }
      }
      // 回代
      const x = new Array(n).fill(0);
      for (let i = n - 1; i >= 0; i--) {
        x[i] = a[i][n] / a[i][i];
        for (let k = i - 1; k >= 0; k--) {
          a[k][n] -= a[k][i] * x[i];
        }
      }
      return x;
    }
    // 构造8x9矩阵，最后一列为常数0
    const M = A.map(row => row.slice());
    for (let i = 0; i < 8; i++) M[i].push(0);
    // 由于齐次方程，令h[8]=1，移到等式右边
    for (let i = 0; i < 8; i++) {
      M[i][8] = -M[i][8];
    }
    // 只解前8个未知数
    const h = gaussianElimination(M, 8);
    h.push(1);
    return h;
  }

  // 单应性矩阵
  const h = getHomography(dstPoints, srcPoints); // 注意: 逆变换
  // h为9维向量，重组为3x3矩阵
  const H = [
    [h[0], h[1], h[2]],
    [h[3], h[4], h[5]],
    [h[6], h[7], h[8]],
  ];

  // 创建目标canvas
  const dstCanvas = document.createElement("canvas");
  dstCanvas.width = dstWidth;
  dstCanvas.height = dstHeight;
  const dstCtx = dstCanvas.getContext("2d");
  if (!dstCtx) throw new Error("无法获取目标canvas上下文");

  const srcCtx = srcCanvas.getContext("2d");
  if (!srcCtx) throw new Error("无法获取源canvas上下文");
  const srcImgData = srcCtx.getImageData(
    0,
    0,
    srcCanvas.width,
    srcCanvas.height
  );
  const dstImgData = dstCtx.createImageData(dstWidth, dstHeight);

  // 对目标canvas每个像素，反向映射到源canvas
  for (let y = 0; y < dstHeight; y++) {
    for (let x = 0; x < dstWidth; x++) {
      // 目标点
      const X = x,
        Y = y;
      // 反向单应性变换
      const denom = H[2][0] * X + H[2][1] * Y + H[2][2];
      const srcX = (H[0][0] * X + H[0][1] * Y + H[0][2]) / denom;
      const srcY = (H[1][0] * X + H[1][1] * Y + H[1][2]) / denom;
      // 取最近邻像素
      const sx = Math.round(srcX);
      const sy = Math.round(srcY);
      if (sx >= 0 && sx < srcCanvas.width && sy >= 0 && sy < srcCanvas.height) {
        const srcIdx = (sy * srcCanvas.width + sx) * 4;
        const dstIdx = (y * dstWidth + x) * 4;
        dstImgData.data[dstIdx] = srcImgData.data[srcIdx];
        dstImgData.data[dstIdx + 1] = srcImgData.data[srcIdx + 1];
        dstImgData.data[dstIdx + 2] = srcImgData.data[srcIdx + 2];
        dstImgData.data[dstIdx + 3] = srcImgData.data[srcIdx + 3];
      }
    }
  }
  dstCtx.putImageData(dstImgData, 0, 0);
  return dstCanvas;
}
