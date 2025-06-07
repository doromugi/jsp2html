<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>サンプルJSPページ</title>
</head>
<body>
    <h1>JSPからHTMLへの変換テスト</h1>
    
    <%-- これはJSPコメントです --%>
    
    <p>ユーザー名: <%= request.getParameter("username") %></p>
    <p>セッションID: <%= session.getAttribute("sessionId") %></p>
    
    <%
        String message = "Hello, World!";
        out.println("動的メッセージ: " + message);
    %>
    
    <div>
        <% if (request.getParameter("showDetails") != null) { %>
            <p>詳細情報が表示されます</p>
        <% } %>
    </div>
    
    <ul>
        <% for (int i = 1; i <= 3; i++) { %>
            <li>アイテム <%= i %></li>
        <% } %>
    </ul>
    
    <%!
        private String formatDate(java.util.Date date) {
            return new java.text.SimpleDateFormat("yyyy-MM-dd").format(date);
        }
    %>
    
    <p>現在の日付: <%= formatDate(new java.util.Date()) %></p>
</body>
</html>