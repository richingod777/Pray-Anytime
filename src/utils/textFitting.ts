/**
 * 隨禱 (Always Near) - 智能文字自動縮放與換行引擎
 * 確保經文與短禱在不同版面與螢幕下「最大化且完整符合版面」
 * 絕不溢出、不裁切，自動換行並計算最適字級
 */

export interface TextFitOptions {
  text: string;
  fontFamily: string;
  maxWidth: number;
  maxHeight: number;
  minFontSize?: number;
  maxFontSize?: number;
  lineHeightRatio?: number;
  fontWeight?: string;
  letterSpacing?: number;
}

export interface FitResult {
  fontSize: number;
  lines: string[];
  lineHeight: number;
  totalHeight: number;
}

/**
 * 針對中英文混合字串進行智能分行
 */
export function wrapTextLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  fontSize: number,
  fontFamily: string,
  fontWeight: string = 'normal'
): string[] {
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  
  // 按照換行符號先切段落
  const paragraphs = text.split('\n');
  const allLines: string[] = [];

  for (const paragraph of paragraphs) {
    if (!paragraph.trim()) {
      allLines.push('');
      continue;
    }

    // 智能切詞：連續英文/數字為一個單詞，中文字元單獨切分
    const tokens: string[] = [];
    let currentToken = '';

    for (let i = 0; i < paragraph.length; i++) {
      const char = paragraph[i];
      // 判斷是否為 ASCII 英數字
      const isAsciiWordChar = /[a-zA-Z0-9_\-.,'"]/.test(char);

      if (isAsciiWordChar) {
        currentToken += char;
      } else {
        if (currentToken.length > 0) {
          tokens.push(currentToken);
          currentToken = '';
        }
        tokens.push(char);
      }
    }
    if (currentToken.length > 0) {
      tokens.push(currentToken);
    }

    let currentLine = '';

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const testLine = currentLine + token;
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;

      if (testWidth > maxWidth && currentLine.length > 0) {
        allLines.push(currentLine);
        currentLine = token;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine.length > 0) {
      allLines.push(currentLine);
    }
  }

  return allLines;
}

/**
 * 二元搜尋演算法：計算「最大且完整符合版面」的最優字級
 */
export function calculateMaxFittingFontSize(
  ctx: CanvasRenderingContext2D,
  options: TextFitOptions
): FitResult {
  const {
    text,
    fontFamily,
    maxWidth,
    maxHeight,
    minFontSize = 14,
    maxFontSize = 96,
    lineHeightRatio = 1.45,
    fontWeight = '500',
  } = options;

  if (!text || text.trim().length === 0) {
    return {
      fontSize: 24,
      lines: [''],
      lineHeight: 24 * lineHeightRatio,
      totalHeight: 24 * lineHeightRatio,
    };
  }

  let low = minFontSize;
  let high = maxFontSize;
  let bestFontSize = minFontSize;
  let bestLines: string[] = [text];

  // 二元搜尋最佳字級（精確至整數像素）
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const lineHeight = mid * lineHeightRatio;
    const testLines = wrapTextLines(ctx, text, maxWidth, mid, fontFamily, fontWeight);
    const totalHeight = testLines.length * lineHeight;

    const fitsHeight = totalHeight <= maxHeight;
    
    // 檢查各行寬度是否有超出
    ctx.font = `${fontWeight} ${mid}px ${fontFamily}`;
    const allLinesFitWidth = testLines.every((l) => ctx.measureText(l).width <= maxWidth + 1);

    if (fitsHeight && allLinesFitWidth) {
      bestFontSize = mid;
      bestLines = testLines;
      low = mid + 1; // 嘗試找更大的字級
    } else {
      high = mid - 1; // 溢出，往小找
    }
  }

  const finalLineHeight = bestFontSize * lineHeightRatio;
  return {
    fontSize: bestFontSize,
    lines: bestLines,
    lineHeight: finalLineHeight,
    totalHeight: bestLines.length * finalLineHeight,
  };
}
