var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');

function templateHTML(title, list, body, control){
  return `
  <!doctype html>
  <html>
  <head>
    <title>WEB1 - ${title}</title>
    <meta charset="utf-8">
  </head>
  <body>
    <h1><a href="/">WEB</a></h1>
    ${list}
    ${control}
    ${body}
  </body>
  </html>
  `;
}

function templateList(filelist){
  var list = '<ul>';
  var i = 0;
  while(i < filelist.length){
    list = list + `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`
    i = i+1;
  };
  list = list + '</ul>';
  return list;
}

// request : 요청할때 웹브라우저가 우리한테 보낸 정보들
// response : 응답할때 우리가 웹브라우저한테 보낸 정보들
var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;
    if(pathname === '/'){
        if(queryData.id === undefined){
          fs.readdir('./data', function(err, filelist) {
                var title = 'Welcome';
                var description = 'Hello, Node.js'
                var list = templateList(filelist)
                var template = templateHTML(title, list, `<h2>${title}</h2>${description}`, `<a href="/create">create</a>`);
                response.writeHead(200);
                response.end(template);
          });
        }else{
          fs.readdir('./data', function(err, filelist) {
            fs.readFile(`data/${queryData.id}`, 'utf8', function(err, description) {
                var title = queryData.id;
                var list = templateList(filelist)
                var template = templateHTML(title, list, `<h2>${title}</h2>${description}`, 
                `<a href="/create">create</a> 
                <a href="/update?id=${title}">update</a> 
                <form action="delete_process" method="post">
                  <input type="hidden" name="id" value="${title}">
                  <input type="submit" value="delete">
                </form>
                `);
                response.writeHead(200);
                response.end(template);
          });
        });
    }} else if(pathname === '/create'){
      fs.readdir('./data', function(err, filelist) {
        var title = 'WEB - create';
        var list = templateList(filelist)
        var template = templateHTML(title, list, `
          <form action="/create_process" method="post">
            <p><input type="text" name="title" placeholder="title"></p>
            <p>
              <textarea name="description" placeholder="description"></textarea>
            </p>
            <p>  
              <input type="submit">
            </p>
          </form>
        `,
        '');
        response.writeHead(200);
        response.end(template);
  });
    } else if(pathname === '/create_process'){
        var body = '';
        request.on('data', function(data){
          body += data; //data callback이 실행될때마다 계속 body에 정보를 추가하는 것.
        });
        // 정보를 다 호출했으면 'end'가 호출
        request.on('end', function(){
          // 최종적으로 post에 우리 정보가 들어있음.
          var post = qs.parse(body);
          var title = post.title;
          var description = post.description;
          fs.writeFile(`data/${title}`, description, 'utf8', function(err){
            //302 : redirection
            response.writeHead(302, {
              Location: `/?id=${title}`
            });
            response.end();
          });
        });
    } else if(pathname === '/update'){
      fs.readdir('./data', function(err, filelist) {
        fs.readFile(`data/${queryData.id}`, 'utf8', function(err, description) {
            var title = queryData.id;
            var list = templateList(filelist)
            var template = templateHTML(title, list, 
            `
            <form action="/update_process" method="post">
            <input type="hidden" name="id" value="${title}">
            <p><input type="text" name="title" placeholder="title" value="${title}"></p>
            <p>
              <textarea name="description" placeholder="description">${description}</textarea>
            </p>
            <p>  
              <input type="submit">
            </p>
          </form>
            `, `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`);
            response.writeHead(200);
            response.end(template);
      });
    });
    } else if (pathname === '/update_process'){
      var body = '';
      request.on('data', function(data){
        body += data;
      });
      request.on('end', function(){
        var post = qs.parse(body);
        var id = post.id;
        var title = post.title;
        var description = post.description;
        fs.rename(`data/${id}`, `data/${title}`, function(err){
           fs.writeFile(`data/${title}`, description, 'utf8', function(err){
          response.writeHead(302, {
            Location: `/?id=${title}`
          });
          response.end();
        });
        })
      });
    } else if (pathname === '/delete_process'){
      var body = '';
      request.on('data', function(data){
        body += data;
      });
      request.on('end', function(){
        var post = qs.parse(body);
        var id = post.id;
        fs.unlink(`data/${id}`, function(err){
          response.writeHead(302, {
            Location: `/`
          });
          response.end();
        })
      });
    } 
    else{
        response.writeHead(404);
        response.end('Not found');
    }
});
app.listen(3000);