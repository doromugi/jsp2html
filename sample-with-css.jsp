<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%-- css: main.css, layout.css --%>
<c:set var="css_file_names" value="main.css,layout.css" />
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CSS付きJSPサンプル</title>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>CSS付きJSPページのサンプル</h1>
            <p>スタイルシートが適用されたJSPページです</p>
        </div>
        
        <%-- これはJSPコメントです。CSSファイルが正しく読み込まれているかテストします --%>
        
        <div class="user-info">
            <h2>ユーザー情報</h2>
            <p>ユーザー名: <span class="highlight"><%= request.getParameter("username") %></span></p>
            <p>セッションID: <span class="highlight"><%= session.getAttribute("sessionId") %></span></p>
            
            <%
                String cssFiles = "main.css,layout.css";
                out.println("<p>使用中のCSSファイル: " + cssFiles + "</p>");
            %>
        </div>
        
        <div class="content-grid">
            <% if (request.getParameter("showDetails") != null) { %>
                <div class="card">
                    <h3>詳細情報</h3>
                    <p>詳細情報が表示されています。</p>
                    <p>このセクションは条件付きで表示されます。</p>
                </div>
            <% } %>
            
            <div class="card">
                <h3>メニュー一覧</h3>
                <ul>
                    <% for (int i = 1; i <= 5; i++) { %>
                        <li>メニュー項目 <%= i %></li>
                    <% } %>
                </ul>
            </div>
        </div>
        
        <%!
            private String getCurrentDate() {
                return new java.text.SimpleDateFormat("yyyy年MM月dd日").format(new java.util.Date());
            }
        %>
        
        <div class="footer">
            <p>生成日時: <%= getCurrentDate() %></p>
            <p>このページはJSPからHTMLに変換されました</p>
        </div>
    </div>
</body>
</html>