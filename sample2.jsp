%@ page contentType=texthtml;charset=UTF-8 language=java %
%@ taglib prefix=c uri=httpjava.sun.comjspjstlcore %
%-- ユーザー情報表示ページ --%
!DOCTYPE html
html
head
    titleユーザー情報title
head
body

h1こんにちは、%= session.getAttribute(userName) %さん！h1

%
    String userType = (String) session.getAttribute(userType);
    if (admin.equals(userType)) {
%
    pあなたは管理者です。p
%
    } else {
%
    p一般ユーザーとしてログインしています。p
%
    }
%

h2パラメータ確認h2
ul
    liID %= request.getParameter(id) %li
    liEmail %= request.getParameter(email) %li
ul

h2お知らせ一覧h2
%
    ListString notices = new ArrayList();
    notices.add(メンテナンス予定：7月1日);
    notices.add(新機能リリース：チャットサポート);
    for (String notice  notices) {
%
    div class=notice%= notice %div
%
    }
%

%!
     宣言ブロック
    private String formatDate(Date date) {
        return new java.text.SimpleDateFormat(yyyyMMdd).format(date);
    }
%

p本日の日付 %= formatDate(new Date()) %p

body
html