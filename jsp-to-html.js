#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class JSPToHTMLConverter {
  constructor() {
    this.scriptletPattern = /<%(.+?)%>/gs;
    this.expressionPattern = /<%=(.+?)%>/gs;
    this.directivePattern = /<%@(.+?)%>/gs;
    this.declarationPattern = /<%!(.+?)%>/gs;
    this.commentPattern = /<%--(.+?)--%>/gs;
    // <c:set>タグを柔軟に検出するパターン
    this.cssSetPattern = /<c:set\b[^>]*\/?>(?:<\/c:set>)?/gi;
    this.linkPattern = /<link[^>]+rel=["']stylesheet["'][^>]*>/gi;
    this.stylePattern = /<style[^>]*>[\s\S]*?<\/style>/gi;
    this.extractedCssFiles = [];
    this.cssFolder = 'css';
  }

  convert(jspContent) {
    let htmlContent = jspContent;

    // 既存のCSS linkタグを抽出
    const existingLinks = [...htmlContent.matchAll(this.linkPattern)];
    
    // 既存のstyleタグを抽出
    const existingStyles = [...htmlContent.matchAll(this.stylePattern)];

    // CSSファイル名を抽出して保存（重複を避けるためSetを使用）
    const cssFileSet = new Set();
    
    const cssMatches = [...htmlContent.matchAll(this.cssSetPattern)];
    cssMatches.forEach(match => {
      const tag = match[0];
      if (/var=["']css_file_names["']/i.test(tag)) {
        const valueMatch = tag.match(/value=["']([^"']+)["']/i);
        if (valueMatch) {
          valueMatch[1].split(',').forEach(file => cssFileSet.add(file.trim()));
        }
      }
    });

    // コメント内のCSS指定を探す
    const cssCommentMatches = [...htmlContent.matchAll(/<%--\s*css\s*:\s*([^-]+)\s*--%>/gi)];
    cssCommentMatches.forEach(match => {
      match[1].split(',').forEach(file => cssFileSet.add(file.trim()));
    });

    // スクリプトレット内のCSS設定を探す
    const scriptletCssMatches = [...htmlContent.matchAll(/<%[^>]*String\s+cssFiles\s*=\s*"([^"]+)"[^>]*%>/gi)];
    scriptletCssMatches.forEach(match => {
      match[1].split(',').forEach(file => cssFileSet.add(file.trim()));
    });
    
    this.extractedCssFiles = Array.from(cssFileSet).filter(file => file.length > 0);

    htmlContent = htmlContent.replace(this.commentPattern, '');
    htmlContent = htmlContent.replace(this.directivePattern, '');
    htmlContent = htmlContent.replace(this.declarationPattern, '');
    htmlContent = htmlContent.replace(this.expressionPattern, (match, code) => {
      return this.processExpression(code.trim());
    });
    htmlContent = htmlContent.replace(this.scriptletPattern, (match, code) => {
      return this.processScriptlet(code.trim());
    });

    // c:setタグを削除
    htmlContent = htmlContent.replace(this.cssSetPattern, '');

    // 抽出したCSSファイルのリンクを追加
    if (this.extractedCssFiles.length > 0) {
      const cssLinks = this.extractedCssFiles
        .map(file => {
          // ファイル名だけの場合はcssフォルダのパスを追加
          const cssPath = file.includes('/') ? file : `${this.cssFolder}/${file}`;
          return `<link rel="stylesheet" href="${cssPath}" />`;
        })
        .join('\n    ');
      
      // headタグ内にCSSリンクを挿入
      if (htmlContent.includes('</head>')) {
        htmlContent = htmlContent.replace('</head>', `    ${cssLinks}\n</head>`);
      } else if (htmlContent.includes('<head>')) {
        htmlContent = htmlContent.replace('<head>', `<head>\n    ${cssLinks}`);
      }
    }

    return htmlContent;
  }

  processExpression(code) {
    if (code.includes('request.getParameter')) {
      const paramMatch = code.match(/request\.getParameter\("(.+?)"\)/);
      if (paramMatch) {
        return `[${paramMatch[1]}]`;
      }
    }
    
    if (code.includes('session.getAttribute')) {
      const attrMatch = code.match(/session\.getAttribute\("(.+?)"\)/);
      if (attrMatch) {
        return `[session:${attrMatch[1]}]`;
      }
    }

    if (code.startsWith('"') && code.endsWith('"')) {
      return code.slice(1, -1);
    }

    return `[${code}]`;
  }

  processScriptlet(code) {
    if (code.includes('if') && code.includes('{')) {
      return `<!-- ${code} -->`;
    }
    
    if (code.includes('for') && code.includes('{')) {
      return `<!-- ${code} -->`;
    }
    
    if (code.includes('out.println')) {
      const printMatch = code.match(/out\.println\("(.+?)"\)/);
      if (printMatch) {
        return printMatch[1];
      }
    }
    
    return `<!-- ${code} -->`;
  }

  convertFile(inputPath, outputPath) {
    try {
      const jspContent = fs.readFileSync(inputPath, 'utf-8');
      const htmlContent = this.convert(jspContent);
      
      if (outputPath) {
        fs.writeFileSync(outputPath, htmlContent);
        console.log(`変換完了: ${inputPath} -> ${outputPath}`);
      } else {
        const outputFile = inputPath.replace(/\.jsp$/, '.html');
        fs.writeFileSync(outputFile, htmlContent);
        console.log(`変換完了: ${inputPath} -> ${outputFile}`);
      }
    } catch (error) {
      console.error(`エラー: ${error.message}`);
    }
  }
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('使用方法: node jsp-to-html.js <input.jsp> [output.html]');
    console.log('例: node jsp-to-html.js sample.jsp');
    console.log('例: node jsp-to-html.js sample.jsp output.html');
    return;
  }

  const inputFile = args[0];
  const outputFile = args[1];

  if (!fs.existsSync(inputFile)) {
    console.error(`ファイルが見つかりません: ${inputFile}`);
    return;
  }

  const converter = new JSPToHTMLConverter();
  converter.convertFile(inputFile, outputFile);
}

if (require.main === module) {
  main();
}

module.exports = JSPToHTMLConverter;