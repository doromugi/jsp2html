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
  }

  convert(jspContent) {
    let htmlContent = jspContent;

    htmlContent = htmlContent.replace(this.commentPattern, '');
    htmlContent = htmlContent.replace(this.directivePattern, '');
    htmlContent = htmlContent.replace(this.declarationPattern, '');
    htmlContent = htmlContent.replace(this.expressionPattern, (match, code) => {
      return this.processExpression(code.trim());
    });
    htmlContent = htmlContent.replace(this.scriptletPattern, (match, code) => {
      return this.processScriptlet(code.trim());
    });

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